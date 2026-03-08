// Расчёт материалов для утепления
import { HouseParams, MaterialItem, CALCULATION_CONSTANTS } from '../types';

// Названия утеплителей
const INSULATION_NAMES: Record<string, string> = {
  mineral: 'Минеральная вата',
  eco: 'Эковата',
  foam: 'Пенопласт/ППУ',
};

export function calculateInsulation(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const {
    length,
    width,
    floorHeight,
    floors,
    hasAttic,
    externalWalls,
    externalWallThickness,
    insulationType,
    insulationThickness,
    smallWindows,
    mediumWindows,
    largeWindows,
    externalDoors,
  } = params;
  
  const perimeter = 2 * (length + width);
  const houseArea = length * width;
  const insulationThicknessM = insulationThickness / 1000; // в метрах
  
  // Площадь проёмов
  const windowsArea = 
    smallWindows * CALCULATION_CONSTANTS.SMALL_WINDOW_AREA +
    mediumWindows * CALCULATION_CONSTANTS.MEDIUM_WINDOW_AREA +
    largeWindows * CALCULATION_CONSTANTS.LARGE_WINDOW_AREA;
  const doorsArea = externalDoors * CALCULATION_CONSTANTS.EXTERNAL_DOOR_AREA;
  const totalOpeningsArea = (windowsArea + doorsArea) * floors;
  
  // ===== УТЕПЛЕНИЕ СТЕН =====
  const externalWallArea = perimeter * floorHeight * floors - totalOpeningsArea;
  
  // Объём утеплителя для стен
  // Толщина утеплителя берётся либо равной толщине стены, либо задаётся отдельно
  const wallInsulationThickness = Math.min(insulationThicknessM, externalWallThickness / 1000);
  const wallInsulationVolume = externalWallArea * wallInsulationThickness;
  
  materials.push({
    category: 'insulation',
    name: `${INSULATION_NAMES[insulationType]} для стен`,
    quantity: Math.ceil(wallInsulationVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'м³',
    notes: `Толщина ${insulationThickness} мм`,
  });
  
  // ===== УТЕПЛЕНИЕ ПОЛА (первого этажа) =====
  const floorInsulationVolume = houseArea * insulationThicknessM;
  
  materials.push({
    category: 'insulation',
    name: `${INSULATION_NAMES[insulationType]} для пола`,
    quantity: Math.ceil(floorInsulationVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'м³',
    notes: 'Утепление по лагам',
  });
  
  // ===== УТЕПЛЕНИЕ ПОТОЛКА/КРЫШИ =====
  const roofInsulationVolume = houseArea * insulationThicknessM;
  
  materials.push({
    category: 'insulation',
    name: `${INSULATION_NAMES[insulationType]} для потолка/крыши`,
    quantity: Math.ceil(roofInsulationVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'м³',
    notes: 'Утепление чердачного перекрытия',
  });
  
  // ===== УТЕПЛЕНИЕ ВНУТРЕННИХ СТЕН (межкомнатная звукоизоляция) =====
  if (params.internalWalls > 0) {
    const internalWallArea = params.internalWalls * floorHeight * floors;
    const internalDoorsArea = params.internalDoors * CALCULATION_CONSTANTS.INTERNAL_DOOR_AREA * floors;
    const netInternalWallArea = internalWallArea - internalDoorsArea;
    
    // Звукоизоляция 50 мм
    const soundproofVolume = netInternalWallArea * 0.05;
    
    materials.push({
      category: 'insulation',
      name: `${INSULATION_NAMES[insulationType]} для звукоизоляции`,
      quantity: Math.ceil(soundproofVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
      unit: 'м³',
      notes: 'Внутренние перегородки, 50 мм',
    });
  }
  
  // ===== ПАРОИЗОЛЯЦИЯ =====
  const vaporBarrierArea = externalWallArea * CALCULATION_CONSTANTS.OVERLAP_FACTOR +
    houseArea * floors * CALCULATION_CONSTANTS.OVERLAP_FACTOR;
  
  materials.push({
    category: 'insulation',
    name: 'Плёнка пароизоляционная',
    quantity: Math.ceil(vaporBarrierArea),
    unit: 'м²',
    notes: 'Стены и потолок',
  });
  
  // ===== ПЛИТЫ УТЕПЛИТЕЛЯ (если минвата) =====
  if (insulationType === 'mineral') {
    // Стандартная плита минваты 600×1200 мм
    const plateArea = 0.6 * 1.2; // 0.72 м²
    const totalInsulationArea = externalWallArea + houseArea * 2; // стены + пол + потолок
    
    materials.push({
      category: 'insulation',
      name: `Плиты минераловатные ${insulationThickness}мм`,
      quantity: Math.ceil(totalInsulationArea / plateArea * CALCULATION_CONSTANTS.WASTE_FACTOR),
      unit: 'плита',
      notes: '600×1200 мм',
    });
  }
  
  // ===== МАНСАРДА =====
  if (hasAttic) {
    // Утепление скатов крыши
    const roofArea = calculateRoofAreaForInsulation(params);
    const atticInsulationVolume = roofArea * insulationThicknessM;
    
    materials.push({
      category: 'insulation',
      name: `${INSULATION_NAMES[insulationType]} для стен мансарды`,
      quantity: Math.ceil(atticInsulationVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
      unit: 'м³',
      notes: 'Утепление скатов',
    });
  }
  
  // ===== ДОПОЛНИТЕЛЬНО: ТЕПЛОИЗОЛЯЦИЯ ФУНДАМЕНТА =====
  // Экструдированный пенополистирол для отмостки и цоколя
  const foundationInsulationArea = perimeter * params.foundationDepth;
  
  materials.push({
    category: 'insulation',
    name: 'Пенополистирол экструдированный 50мм',
    quantity: Math.ceil(foundationInsulationArea * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'м²',
    notes: 'Утепление цоколя/отмостки',
  });
  
  return materials;
}

// Вспомогательная функция расчёта площади крыши
function calculateRoofAreaForInsulation(params: HouseParams): number {
  const { length, width, roofType, roofAngle } = params;
  const angleRad = (roofAngle * Math.PI) / 180;
  const halfWidth = width / 2;
  
  switch (roofType) {
    case 'gable': {
      const rafterLength = halfWidth / Math.cos(angleRad);
      return length * rafterLength * 2;
    }
    case 'shed': {
      const rafterLength = width / Math.cos(angleRad);
      return length * rafterLength;
    }
    case 'hip': {
      const rafterLength = halfWidth / Math.cos(angleRad);
      return (length * rafterLength * 2) + (halfWidth * rafterLength * 2);
    }
    default:
      return 0;
  }
}

// Общий объём утеплителя
export function getTotalInsulationVolume(params: HouseParams): number {
  const {
    length,
    width,
    floorHeight,
    floors,
    externalWallThickness,
    insulationThickness,
    smallWindows,
    mediumWindows,
    largeWindows,
    externalDoors,
  } = params;
  
  const perimeter = 2 * (length + width);
  const houseArea = length * width;
  const insulationThicknessM = insulationThickness / 1000;
  
  const windowsArea = 
    smallWindows * CALCULATION_CONSTANTS.SMALL_WINDOW_AREA +
    mediumWindows * CALCULATION_CONSTANTS.MEDIUM_WINDOW_AREA +
    largeWindows * CALCULATION_CONSTANTS.LARGE_WINDOW_AREA;
  const doorsArea = externalDoors * CALCULATION_CONSTANTS.EXTERNAL_DOOR_AREA;
  const totalOpeningsArea = (windowsArea + doorsArea) * floors;
  
  const externalWallArea = perimeter * floorHeight * floors - totalOpeningsArea;
  
  const wallVolume = externalWallArea * Math.min(insulationThicknessM, externalWallThickness / 1000);
  const floorVolume = houseArea * insulationThicknessM;
  const ceilingVolume = houseArea * insulationThicknessM;
  
  return (wallVolume + floorVolume + ceilingVolume) * CALCULATION_CONSTANTS.WASTE_FACTOR;
}
