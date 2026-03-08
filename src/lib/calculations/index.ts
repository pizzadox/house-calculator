// Главный модуль расчётов - объединяет все категории
import { HouseParams, MaterialItem, CalculationResult, CATEGORY_NAMES, BuildingTechnology, CALCULATION_CONSTANTS } from '../types';
import { calculateFoundation } from './foundation';
import { calculateFrame, calculateRoofFrame, getRoofArea } from './frame';
import { calculateSheathing, calculateRoofSheathing } from './sheathing';
import { calculateInsulation, getTotalInsulationVolume } from './insulation';
import { calculateFasteners, calculateWindowsDoorsFasteners } from './fasteners';
import { calculateRoof } from './roof';

// Импорт модулей для разных технологий
import { calculateSIP } from './technologies/sip';
import { calculateGasobeton } from './technologies/gasobeton';
import { calculateConcreteSlab } from './technologies/concrete-slab';
import { calculateLogHouse } from './technologies/log';
import { calculateBrick } from './technologies/brick';

export function calculateAll(params: HouseParams): CalculationResult {
  const materials: MaterialItem[] = [];
  
  // Определяем технологию строительства
  const technology = params.buildingTechnology || 'frame';
  
  // ===== РАСЧЁТ ПО ТЕХНОЛОГИИ =====
  
  switch (technology) {
    case 'sip':
      // SIP-панельный дом
      materials.push(...calculateSIP(params));
      materials.push(...calculateFoundation(params));
      materials.push(...calculateRoof(params));
      materials.push(...calculateWindowsDoors(params));
      break;
      
    case 'gasobeton':
      // Газобетонный дом
      materials.push(...calculateGasobeton(params));
      materials.push(...calculateFoundation(params));
      materials.push(...calculateRoof(params));
      materials.push(...calculateWindowsDoors(params));
      break;
      
    case 'concrete_slab':
      // Дом из Ж/Б плит
      materials.push(...calculateConcreteSlab(params));
      materials.push(...calculateFoundation(params));
      materials.push(...calculateWindowsDoors(params));
      break;
      
    case 'log':
      // Бревенчатый дом (сруб)
      materials.push(...calculateLogHouse(params));
      materials.push(...calculateFoundation(params));
      break;
      
    case 'brick':
      // Кирпичный дом
      materials.push(...calculateBrick(params));
      materials.push(...calculateWindowsDoors(params));
      break;
      
    case 'frame':
    default:
      // Каркасный дом (по умолчанию)
      // 1. Фундамент
      materials.push(...calculateFoundation(params));
      
      // 2. Каркас (стены, перекрытия, стропильная система)
      materials.push(...calculateFrame(params));
      materials.push(...calculateRoofFrame(params));
      
      // 3. Обшивка (ОСП, мембраны)
      materials.push(...calculateSheathing(params));
      materials.push(...calculateRoofSheathing(params));
      
      // 4. Утепление
      materials.push(...calculateInsulation(params));
      
      // 5. Крепёж
      materials.push(...calculateFasteners(params));
      materials.push(...calculateWindowsDoorsFasteners(params));
      
      // 6. Кровля
      materials.push(...calculateRoof(params));
      
      // 7. Отделка
      materials.push(...calculateFinish(params));
      
      // 8. Окна и двери
      materials.push(...calculateWindowsDoors(params));
      break;
  }
  
  // Расчёт сводных показателей
  const summary = calculateSummary(params, materials);
  
  return {
    materials,
    summary,
  };
}

// Расчёт отделки
function calculateFinish(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const {
    length,
    width,
    floorHeight,
    floors,
    externalWalls,
    internalWalls,
    exteriorFinish,
    smallWindows,
    mediumWindows,
    largeWindows,
    externalDoors,
    internalDoors,
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
  
  // Площадь внешних стен
  const externalWallArea = perimeter * floorHeight * floors - totalOpeningsArea;
  
  // ===== ВНЕШНЯЯ ОТДЕЛКА =====
  switch (exteriorFinish) {
    case 'siding': {
      const sidingArea = externalWallArea * CALCULATION_CONSTANTS.WASTE_FACTOR;
      materials.push({
        category: 'finish',
        name: 'Сайдинг виниловый',
        quantity: Math.ceil(sidingArea),
        unit: 'м²',
        notes: 'С запасом 10%',
      });
      
      // Комплектующие для сайдинга
      materials.push({
        category: 'finish',
        name: 'Стартовая планка',
        quantity: Math.ceil(perimeter * floors),
        unit: 'п.м.',
        notes: 'Нижний ряд',
      });
      
      materials.push({
        category: 'finish',
        name: 'J-профиль',
        quantity: Math.ceil(perimeter * 2 * floors),
        unit: 'п.м.',
        notes: 'Обрамление проёмов',
      });
      
      materials.push({
        category: 'finish',
        name: 'Наружный угол',
        quantity: Math.ceil(floorHeight * floors * 4),
        unit: 'п.м.',
        notes: 'Углы дома',
      });
      
      materials.push({
        category: 'finish',
        name: 'Внутренний угол',
        quantity: Math.ceil(floorHeight * floors * externalWalls / 2),
        unit: 'п.м.',
        notes: 'Внутренние углы',
      });
      
      materials.push({
        category: 'finish',
        name: 'H-профиль',
        quantity: Math.ceil(floorHeight * floors * Math.ceil(perimeter / 6)),
        unit: 'п.м.',
        notes: 'Соединение панелей',
      });
      
      break;
    }
    
    case 'blockhouse': {
      const blockhouseArea = externalWallArea * CALCULATION_CONSTANTS.WASTE_FACTOR;
      materials.push({
        category: 'finish',
        name: 'Блок-хаус',
        quantity: Math.ceil(blockhouseArea),
        unit: 'м²',
        notes: 'Имитация бревна',
      });
      
      // Комплектующие
      materials.push({
        category: 'finish',
        name: 'Угловой профиль для блок-хауса',
        quantity: Math.ceil(floorHeight * floors * 4),
        unit: 'п.м.',
        notes: 'Углы дома',
      });
      
      materials.push({
        category: 'finish',
        name: 'Саморезы для блок-хауса',
        quantity: Math.ceil(externalWallArea * 10),
        unit: 'шт',
        notes: 'Кровельные с EPDM',
      });
      
      break;
    }
    
    case 'plaster': {
      const plasterArea = externalWallArea * CALCULATION_CONSTANTS.WASTE_FACTOR;
      
      materials.push({
        category: 'finish',
        name: 'Штукатурка фасадная',
        quantity: Math.ceil(plasterArea * 0.02), // 2 см слой
        unit: 'м³',
        notes: 'Цементно-песчаная',
      });
      
      materials.push({
        category: 'finish',
        name: 'Грунтовка фасадная',
        quantity: Math.ceil(plasterArea / 10),
        unit: 'л',
        notes: '10 м² на литр',
      });
      
      materials.push({
        category: 'finish',
        name: 'Краска фасадная',
        quantity: Math.ceil(plasterArea / 8),
        unit: 'л',
        notes: '8 м² на литр в 2 слоя',
      });
      
      materials.push({
        category: 'finish',
        name: 'Сетка штукатурная',
        quantity: Math.ceil(plasterArea),
        unit: 'м²',
        notes: 'Армирование',
      });
      
      materials.push({
        category: 'finish',
        name: 'Уголок штукатурный перфорированный',
        quantity: Math.ceil(floorHeight * floors * 6),
        unit: 'п.м.',
        notes: 'Углы и откосы',
      });
      
      break;
    }
  }
  
  // ===== ВНУТРЕННЯЯ ОТДЕЛКА =====
  
  // Гипсокартон
  const internalWallArea = (internalWalls || 0) * floorHeight * floors;
  const internalDoorsArea = internalDoors * CALCULATION_CONSTANTS.INTERNAL_DOOR_AREA * floors;
  const netInternalWallArea = internalWallArea - internalDoorsArea;
  
  const drywallWalls = (externalWallArea + netInternalWallArea) * 2; // с двух сторон
  const drywallCeilings = houseArea * floors;
  const drywallTotal = drywallWalls + drywallCeilings;
  
  const drywallSheets = Math.ceil(drywallTotal / 3 * CALCULATION_CONSTANTS.WASTE_FACTOR); // лист 3 м²
  
  materials.push({
    category: 'finish',
    name: 'Гипсокартон обычный 12.5мм',
    quantity: drywallSheets,
    unit: 'лист',
    notes: 'Стены и потолок',
  });
  
  // Профиль для ГКЛ
  const profileLength = drywallTotal * 3; // 3 м профиля на м²
  
  materials.push({
    category: 'finish',
    name: 'Профиль CD 60×27',
    quantity: Math.ceil(profileLength * 0.7),
    unit: 'п.м.',
    notes: 'Основной профиль',
  });
  
  materials.push({
    category: 'finish',
    name: 'Профиль UD 28×27',
    quantity: Math.ceil(profileLength * 0.3),
    unit: 'п.м.',
    notes: 'Направляющий профиль',
  });
  
  // Шпаклёвка
  const puttyKg = drywallTotal * 0.5; // 0.5 кг/м²
  
  materials.push({
    category: 'finish',
    name: 'Шпаклёвка гипсовая',
    quantity: Math.ceil(puttyKg / 25),
    unit: 'мешок 25кг',
    notes: 'Заделка швов',
  });
  
  // Лента серпянка
  materials.push({
    category: 'finish',
    name: 'Лента-серпянка',
    quantity: Math.ceil(drywallTotal / 2),
    unit: 'м',
    notes: 'Швы ГКЛ',
  });
  
  // Грунтовка
  materials.push({
    category: 'finish',
    name: 'Грунтовка глубокого проникновения',
    quantity: Math.ceil((drywallTotal + externalWallArea) / 10),
    unit: 'л',
    notes: 'Под отделку',
  });
  
  // ===== ПОЛ =====
  
  // Черновой пол уже учтён в каркасе (ОСП)
  
  // Чистовой пол (лаги + фанера + финишное покрытие)
  materials.push({
    category: 'finish',
    name: 'Фанера ФК 18мм для пола',
    quantity: Math.ceil(houseArea * floors * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'м²',
    notes: 'Под чистовое покрытие',
  });
  
  // Плинтус
  const baseboardLength = (perimeter + (internalWalls || 0) * 2) * floors;
  
  materials.push({
    category: 'finish',
    name: 'Плинтус пластиковый',
    quantity: Math.ceil(baseboardLength * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'п.м.',
    notes: 'С уголками и стыками',
  });
  
  return materials;
}

// Расчёт окон и дверей
function calculateWindowsDoors(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  
  // Окна
  if (params.smallWindows > 0) {
    materials.push({
      category: 'windows',
      name: 'Окно малое (600×1000)',
      quantity: params.smallWindows * params.floors,
      unit: 'шт',
      notes: 'Площадь 0.6 м²',
    });
  }
  
  if (params.mediumWindows > 0) {
    materials.push({
      category: 'windows',
      name: 'Окно среднее (1000×1200)',
      quantity: params.mediumWindows * params.floors,
      unit: 'шт',
      notes: 'Площадь 1.2 м²',
    });
  }
  
  if (params.largeWindows > 0) {
    materials.push({
      category: 'windows',
      name: 'Окно большое (1500×1500)',
      quantity: params.largeWindows * params.floors,
      unit: 'шт',
      notes: 'Площадь 2.25 м²',
    });
  }
  
  // Двери внешние
  if (params.externalDoors > 0) {
    materials.push({
      category: 'windows',
      name: 'Дверь входная металлическая',
      quantity: params.externalDoors,
      unit: 'шт',
      notes: 'С утеплением и замком',
    });
  }
  
  // Двери внутренние
  if (params.internalDoors > 0) {
    materials.push({
      category: 'windows',
      name: 'Дверь межкомнатная',
      quantity: params.internalDoors * params.floors,
      unit: 'шт',
      notes: 'С коробкой и наличниками',
    });
  }
  
  return materials;
}

// Расчёт сводных показателей
function calculateSummary(params: HouseParams, materials: MaterialItem[]) {
  const { length, width, floorHeight, floors } = params;
  const perimeter = 2 * (length + width);
  const houseArea = length * width;
  
  // Общий объём пиломатериалов (м³)
  const lumberItems = materials.filter(m => 
    m.unit === 'п.м.' && m.category === 'frame'
  );
  const totalLumberVolume = lumberItems.reduce((sum, item) => {
    // Ориентировочно: 50мм × 150мм = 0.0075 м² сечения
    const avgSection = 0.05 * 0.175; // среднее сечение доски
    return sum + (item.quantity * avgSection);
  }, 0);
  
  // Общий объём утеплителя
  const totalInsulationVolume = getTotalInsulationVolume(params);
  
  // Площадь крыши
  const totalRoofArea = getRoofArea(params);
  
  // Площадь стен
  const totalWallArea = perimeter * floorHeight * floors;
  
  // Площадь полов
  const totalFloorArea = houseArea * floors;
  
  return {
    totalLumberVolume: Math.round(totalLumberVolume * 100) / 100,
    totalInsulationVolume: Math.round(totalInsulationVolume * 100) / 100,
    totalRoofArea: Math.round(totalRoofArea * 100) / 100,
    totalWallArea: Math.round(totalWallArea * 100) / 100,
    totalFloorArea: Math.round(totalFloorArea * 100) / 100,
    totalCost: 0,
  };
}
