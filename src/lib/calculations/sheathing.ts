// Расчёт материалов для обшивки
import { HouseParams, MaterialItem, CALCULATION_CONSTANTS } from '../types';

export function calculateSheathing(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const {
    length,
    width,
    floorHeight,
    floors,
    hasAttic,
    externalWalls,
    smallWindows,
    mediumWindows,
    largeWindows,
    externalDoors,
  } = params;
  
  const perimeter = 2 * (length + width);
  const houseArea = length * width;
  
  // Площадь проёмов
  const windowsArea = 
    smallWindows * CALCULATION_CONSTANTS.SMALL_WINDOW_AREA +
    mediumWindows * CALCULATION_CONSTANTS.MEDIUM_WINDOW_AREA +
    largeWindows * CALCULATION_CONSTANTS.LARGE_WINDOW_AREA;
  const doorsArea = externalDoors * CALCULATION_CONSTANTS.EXTERNAL_DOOR_AREA;
  const totalOpeningsArea = (windowsArea + doorsArea) * floors;
  
  // ===== ОСП ДЛЯ ВНЕШНИХ СТЕН =====
  // Площадь внешних стен с учётом проёмов
  const externalWallArea = perimeter * floorHeight * floors - totalOpeningsArea;
  
  // ОСП снаружи и внутри
  const totalOsbArea = externalWallArea * 2;
  const osbSheets = Math.ceil(totalOsbArea / CALCULATION_CONSTANTS.OSB_SHEET_AREA * CALCULATION_CONSTANTS.WASTE_FACTOR);
  
  materials.push({
    category: 'sheathing',
    name: 'ОСП-3 12мм для внешних стен',
    quantity: osbSheets,
    unit: 'лист',
    notes: 'Снаружи и внутри, лист 1250×2500 мм',
  });
  
  // ===== ОСП ДЛЯ ВНУТРЕННИХ СТЕН =====
  if (params.internalWalls > 0) {
    const internalWallArea = params.internalWalls * floorHeight * floors;
    const internalDoorsArea = params.internalDoors * CALCULATION_CONSTANTS.INTERNAL_DOOR_AREA * floors;
    const netInternalWallArea = internalWallArea - internalDoorsArea;
    
    const internalOsbArea = netInternalWallArea * 2;
    const internalOsbSheets = Math.ceil(internalOsbArea / CALCULATION_CONSTANTS.OSB_SHEET_AREA * CALCULATION_CONSTANTS.WASTE_FACTOR);
    
    materials.push({
      category: 'sheathing',
      name: 'ОСП-3 12мм для внутренних стен',
      quantity: internalOsbSheets,
      unit: 'лист',
      notes: 'С двух сторон',
    });
  }
  
  // ===== ВЕТРОЗАЩИТНАЯ МЕМБРАНА =====
  const membraneArea = externalWallArea * CALCULATION_CONSTANTS.OVERLAP_FACTOR;
  
  materials.push({
    category: 'sheathing',
    name: 'Мембрана ветрозащитная',
    quantity: Math.ceil(membraneArea),
    unit: 'м²',
    notes: 'С нахлёстом 15%',
  });
  
  // ===== ПАРОИЗОЛЯЦИЯ =====
  // Внутренняя сторона всех стен и потолок
  const vaporBarrierWallArea = externalWallArea * CALCULATION_CONSTANTS.OVERLAP_FACTOR;
  const vaporBarrierCeilingArea = houseArea * floors * CALCULATION_CONSTANTS.OVERLAP_FACTOR;
  
  materials.push({
    category: 'sheathing',
    name: 'Плёнка пароизоляционная',
    quantity: Math.ceil(vaporBarrierWallArea + vaporBarrierCeilingArea),
    unit: 'м²',
    notes: 'Стены и потолки',
  });
  
  // ===== ОСП ДЛЯ КРЫШИ (под кровлю) =====
  // Для мягкой кровли нужна сплошная обрешётка из ОСП
  if (params.roofingMaterial === 'shingle') {
    const roofArea = calculateRoofAreaForSheathing(params);
    const roofOsbSheets = Math.ceil(roofArea / CALCULATION_CONSTANTS.OSB_SHEET_AREA * CALCULATION_CONSTANTS.WASTE_FACTOR);
    
    materials.push({
      category: 'sheathing',
      name: 'ОСП-3 18мм для крыши',
      quantity: roofOsbSheets,
      unit: 'лист',
      notes: 'Под мягкую кровлю',
    });
  }
  
  // ===== СКОБЫ ДЛЯ МЕМБРАНЫ =====
  const staplesKg = Math.ceil((membraneArea + vaporBarrierWallArea + vaporBarrierCeilingArea) / 100);
  
  materials.push({
    category: 'sheathing',
    name: 'Скобы строительные (для степлера)',
    quantity: Math.max(1, staplesKg),
    unit: 'упак',
    notes: '~100 м² на упаковку',
  });
  
  // ===== САМОРЕЗЫ ДЛЯ ОСП =====
  const screwsForOsb = osbSheets * CALCULATION_CONSTANTS.SCREWS_PER_OSB_SHEET;
  
  materials.push({
    category: 'sheathing',
    name: 'Саморезы для ОСП 41мм',
    quantity: Math.ceil(screwsForOsb / 200), // упаковки по 200 шт
    unit: 'упак',
    notes: '200 шт в упаковке',
  });
  
  return materials;
}

// Вспомогательная функция расчёта площади крыши
function calculateRoofAreaForSheathing(params: HouseParams): number {
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

// Расчёт ветрозащиты для крыши
export function calculateRoofSheathing(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const roofArea = calculateRoofAreaForSheathing(params);
  
  // Гидро-ветрозащита под кровлю
  materials.push({
    category: 'sheathing',
    name: 'Мембрана гидро-ветрозащитная для крыши',
    quantity: Math.ceil(roofArea * CALCULATION_CONSTANTS.OVERLAP_FACTOR),
    unit: 'м²',
    notes: 'С нахлёстом 15%',
  });
  
  return materials;
}
