// Расчёт крепежа
import { HouseParams, MaterialItem, CALCULATION_CONSTANTS } from '../types';

export function calculateFasteners(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const {
    length,
    width,
    floorHeight,
    floors,
    externalWallThickness,
    studSpacing,
    smallWindows,
    mediumWindows,
    largeWindows,
    externalDoors,
    internalDoors,
    exteriorFinish,
  } = params;
  
  const perimeter = 2 * (length + width);
  const houseArea = length * width;
  const studSpacingM = studSpacing / 1000;
  
  // Площадь стен
  const windowsArea = 
    smallWindows * CALCULATION_CONSTANTS.SMALL_WINDOW_AREA +
    mediumWindows * CALCULATION_CONSTANTS.MEDIUM_WINDOW_AREA +
    largeWindows * CALCULATION_CONSTANTS.LARGE_WINDOW_AREA;
  const doorsArea = externalDoors * CALCULATION_CONSTANTS.EXTERNAL_DOOR_AREA;
  const wallArea = perimeter * floorHeight * floors;
  const netWallArea = wallArea - (windowsArea + doorsArea) * floors;
  
  // ===== ГВОЗДИ =====
  
  // Гвозди для каркаса
  const nailsForFrame = wallArea * CALCULATION_CONSTANTS.NAILS_PER_SQM_WALL;
  materials.push({
    category: 'fasteners',
    name: 'Гвозди строительные 90мм',
    quantity: Math.ceil(nailsForFrame),
    unit: 'кг',
    notes: 'Сборка каркаса',
  });
  
  // Гвозди для настила пола
  const nailsForFloor = houseArea * floors * CALCULATION_CONSTANTS.NAILS_PER_SQM_FLOOR;
  materials.push({
    category: 'fasteners',
    name: 'Гвозди для пола 60мм',
    quantity: Math.ceil(nailsForFloor),
    unit: 'кг',
    notes: 'Настил пола',
  });
  
  // ===== САМОРЕЗЫ =====
  
  // Саморезы для ОСП
  const osbSheets = Math.ceil((netWallArea * 2) / CALCULATION_CONSTANTS.OSB_SHEET_AREA);
  const screwsForOsb = osbSheets * CALCULATION_CONSTANTS.SCREWS_PER_OSB_SHEET;
  materials.push({
    category: 'fasteners',
    name: 'Саморезы для ОСП 41мм',
    quantity: Math.ceil(screwsForOsb),
    unit: 'шт',
    notes: 'Примерно 100 шт на лист',
  });
  
  // Саморезы для гипсокартона (внутренняя отделка)
  const drywallArea = wallArea * 2 + houseArea * floors;
  const screwsForDrywall = Math.ceil(drywallArea * 30); // 30 шт/м²
  materials.push({
    category: 'fasteners',
    name: 'Саморезы для ГКЛ 25мм',
    quantity: screwsForDrywall,
    unit: 'шт',
    notes: 'Крепление гипсокартона',
  });
  
  // Саморезы для сайдинга/блок-хауса
  if (exteriorFinish === 'siding' || exteriorFinish === 'blockhouse') {
    const finishArea = netWallArea * CALCULATION_CONSTANTS.WASTE_FACTOR;
    const screwsForFinish = Math.ceil(finishArea * CALCULATION_CONSTANTS.SCREWS_PER_SQM_SIDING);
    materials.push({
      category: 'fasteners',
      name: 'Саморезы для сайдинга 35мм',
      quantity: screwsForFinish,
      unit: 'шт',
      notes: 'Крепление внешней отделки',
    });
  }
  
  // Саморезы для стропил
  const raftersCount = Math.ceil(length / CALCULATION_CONSTANTS.DEFAULT_RAFTER_SPACING) * 2 + 2;
  const screwsForRafters = raftersCount * CALCULATION_CONSTANTS.SCREWS_PER_CONNECTION;
  materials.push({
    category: 'fasteners',
    name: 'Саморезы для стропил 100мм',
    quantity: screwsForRafters,
    unit: 'шт',
    notes: 'Крепление стропильной системы',
  });
  
  // ===== УГОЛКИ МЕТАЛЛИЧЕСКИЕ =====
  
  // Уголки для стоек
  const studsCount = Math.ceil(perimeter / studSpacingM) * floors;
  const cornerPlates = studsCount * 2;
  
  materials.push({
    category: 'fasteners',
    name: 'Уголки металлические усиленные',
    quantity: cornerPlates,
    unit: 'шт',
    notes: 'Крепление стоек к обвязке',
  });
  
  // Уголки для лаг
  const joistsCount = Math.ceil(width / CALCULATION_CONSTANTS.DEFAULT_RASTER_SPACING) * floors;
  const joistPlates = joistsCount * 2;
  
  materials.push({
    category: 'fasteners',
    name: 'Уголки для лаг',
    quantity: joistPlates,
    unit: 'шт',
    notes: 'Крепление лаг к обвязке',
  });
  
  // Уголки для стропил
  const rafterPlates = raftersCount * 2;
  materials.push({
    category: 'fasteners',
    name: 'Уголки для стропил',
    quantity: rafterPlates,
    unit: 'шт',
    notes: 'Крепление стропил к мауэрлату',
  });
  
  // ===== ПЛАСТИНЫ МЕТАЛЛИЧЕСКИЕ =====
  
  // Перфорированные пластины для соединений каркаса
  const connectionPlates = studsCount * 0.5; // примерно одна на две стойки
  
  materials.push({
    category: 'fasteners',
    name: 'Пластины перфорированные',
    quantity: Math.ceil(connectionPlates),
    unit: 'шт',
    notes: 'Для усиления соединений',
  });
  
  // ===== АНКЕРЫ И ДЮБЕЛИ =====
  
  // Анкеры для обвязки к фундаменту
  const anchorBolts = Math.ceil(perimeter / 1.5);
  materials.push({
    category: 'fasteners',
    name: 'Анкер-болты М12',
    quantity: anchorBolts,
    unit: 'шт',
    notes: 'Крепление обвязки к фундаменту',
  });
  
  // Дюбели для мембран
  const membraneDobules = Math.ceil(netWallArea * 5); // 5 шт/м²
  materials.push({
    category: 'fasteners',
    name: 'Тарельчатые дюбели',
    quantity: membraneDobules,
    unit: 'шт',
    notes: 'Крепление мембран и утеплителя',
  });
  
  // ===== СКОБЫ =====
  
  // Скобы для степлера
  const membraneArea = netWallArea + houseArea * floors;
  const staples = Math.ceil(membraneArea * 10); // 10 скоб/м²
  materials.push({
    category: 'fasteners',
    name: 'Скобы для степлера 10мм',
    quantity: staples,
    unit: 'шт',
    notes: 'Крепление плёнок',
  });
  
  // ===== БОЛТЫ =====
  
  // Болты для основных узлов
  const bolts = Math.ceil(studsCount * 0.2); // 20% узлов на болтах
  materials.push({
    category: 'fasteners',
    name: 'Болты М10×80 с гайками',
    quantity: bolts,
    unit: 'компл',
    notes: 'Для ответственных узлов',
  });
  
  // ===== ЛЕНТА УПЛОТНИТЕЛЬНАЯ =====
  
  materials.push({
    category: 'fasteners',
    name: 'Лента уплотнительная',
    quantity: Math.ceil(perimeter * floors),
    unit: 'м',
    notes: 'Между венцами',
  });
  
  return materials;
}

// Расчёт крепежа для окон и дверей
export function calculateWindowsDoorsFasteners(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  
  const totalWindows = params.smallWindows + params.mediumWindows + params.largeWindows;
  const totalDoors = params.externalDoors + params.internalDoors;
  
  // Анкеры для окон
  materials.push({
    category: 'fasteners',
    name: 'Анкеры рамные для окон',
    quantity: totalWindows * 8, // 8 анкеров на окно
    unit: 'шт',
    notes: 'Монтаж оконных рам',
  });
  
  // Пена монтажная
  const foamCans = Math.ceil((totalWindows * 1 + totalDoors * 1.5) / 2); // окна 1 баллон, двери 1.5
  materials.push({
    category: 'fasteners',
    name: 'Пена монтажная профессиональная',
    quantity: Math.max(1, foamCans),
    unit: 'баллон',
    notes: 'С пистолетом',
  });
  
  // Лента ПСУЛ
  materials.push({
    category: 'fasteners',
    name: 'Лента ПСУЛ',
    quantity: Math.ceil((totalWindows * 6 + totalDoors * 5)), // периметр проёмов
    unit: 'м',
    notes: 'Уплотнение проёмов',
  });
  
  // Доборные элементы для окон
  materials.push({
    category: 'fasteners',
    name: 'Отливы оконные',
    quantity: totalWindows,
    unit: 'шт',
    notes: 'По размеру окон',
  });
  
  materials.push({
    category: 'fasteners',
    name: 'Подоконники',
    quantity: totalWindows,
    unit: 'шт',
    notes: 'По размеру окон',
  });
  
  // Наличники
  materials.push({
    category: 'fasteners',
    name: 'Наличники оконные',
    quantity: totalWindows * 4, // 4 наличника на окно
    unit: 'шт',
    notes: 'Внутренние и внешние',
  });
  
  // Дверная фурнитура
  materials.push({
    category: 'fasteners',
    name: 'Ручки дверные',
    quantity: params.externalDoors + params.internalDoors,
    unit: 'компл',
    notes: 'С замками для внешних',
  });
  
  // Доводчики для внешних дверей
  materials.push({
    category: 'fasteners',
    name: 'Доводчики дверные',
    quantity: params.externalDoors,
    unit: 'шт',
    notes: 'Для внешних дверей',
  });
  
  return materials;
}
