// Расчёт материалов для каркаса
import { HouseParams, MaterialItem, CALCULATION_CONSTANTS } from '../types';

export function calculateFrame(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const {
    length,
    width,
    floorHeight,
    floors,
    hasAttic,
    externalWalls,
    internalWalls,
    externalWallThickness,
    internalWallThickness,
    studSpacing,
  } = params;
  
  // Периметр внешних стен
  const perimeter = 2 * (length + width);
  // Площадь дома
  const houseArea = length * width;
  
  // Толщина доски для стоек
  const studDepth = externalWallThickness >= 200 
    ? CALCULATION_CONSTANTS.STUD_DEPTH_THICK 
    : CALCULATION_CONSTANTS.STUD_DEPTH_THIN;
  const internalStudDepth = internalWallThickness >= 150 
    ? CALCULATION_CONSTANTS.STUD_DEPTH_THICK 
    : CALCULATION_CONSTANTS.STUD_DEPTH_THIN;
  
  const studSpacingM = studSpacing / 1000; // переводим в метры
  const studWidth = CALCULATION_CONSTANTS.STUD_WIDTH;
  
  // ===== СТОЙКИ КАРКАСА ВНЕШНИХ СТЕН =====
  // Количество стоек на стену = (длина стены / шаг) + угловые
  const studsPerWall = Math.ceil(perimeter / studSpacingM);
  const cornerStuds = 4 * 3; // 3 стойки на каждый угол (сборная колонна)
  const openingStuds = Math.ceil(params.smallWindows + params.mediumWindows + params.largeWindows) * 2 
    + params.externalDoors * 2; // дополнительные стойки вокруг проёмов
  
  const totalExternalStuds = (studsPerWall + cornerStuds + openingStuds) * floors;
  const studLength = totalExternalStuds * floorHeight;
  const studVolume = studLength * studWidth * studDepth;
  
  materials.push({
    category: 'frame',
    name: `Доска 50×${externalWallThickness} для стоек внешних стен`,
    quantity: Math.ceil(studVolume * 1000), // в погонных метрах
    unit: 'п.м.',
    notes: `Объём: ${studVolume.toFixed(2)} м³`,
  });
  
  // ===== ОБВЯЗКА НИЖНЯЯ И ВЕРХНЯЯ =====
  // 2 ряда снизу, 2 ряда сверху на каждом этаже
  const bindingLength = perimeter * 4 * floors;
  const bindingVolume = bindingLength * studWidth * studDepth;
  
  materials.push({
    category: 'frame',
    name: `Доска 50×${externalWallThickness} для обвязки`,
    quantity: Math.ceil(bindingVolume * 1000),
    unit: 'п.М.',
    notes: 'Нижняя и верхняя обвязка (по 2 ряда)',
  });
  
  // ===== ЛАГИ ПОЛА =====
  const joistSpacing = CALCULATION_CONSTANTS.DEFAULT_RASTER_SPACING;
  const joistDepth = CALCULATION_CONSTANTS.STUD_DEPTH_THICK;
  const joistsPerFloor = Math.ceil(width / joistSpacing) + 1;
  const totalJoists = joistsPerFloor * floors;
  const joistLength = totalJoists * length;
  const joistVolume = joistLength * studWidth * joistDepth;
  
  materials.push({
    category: 'frame',
    name: 'Доска 50×200 для лаг пола',
    quantity: Math.ceil(joistVolume * 1000),
    unit: 'п.м.',
    notes: `Шаг ${joistSpacing * 1000} мм`,
  });
  
  // ===== СТОЙКИ ВНУТРЕННИХ СТЕН =====
  if (internalWalls > 0) {
    const internalStuds = Math.ceil(internalWalls / studSpacingM) * floors;
    // Добавляем стойки вокруг дверных проёмов
    const internalOpeningStuds = params.internalDoors * 2 * floors;
    const totalInternalStuds = internalStuds + internalOpeningStuds;
    const internalStudLength = totalInternalStuds * floorHeight;
    const internalStudVolume = internalStudLength * studWidth * internalStudDepth;
    
    materials.push({
      category: 'frame',
      name: `Доска 50×${internalWallThickness} для стоек внутренних стен`,
      quantity: Math.ceil(internalStudVolume * 1000),
      unit: 'п.м.',
      notes: `Объём: ${internalStudVolume.toFixed(2)} м³`,
    });
    
    // Обвязка внутренних стен
    const internalBinding = internalWalls * 2 * floors; // верхняя и нижняя
    const internalBindingVolume = internalBinding * studWidth * internalStudDepth;
    
    materials.push({
      category: 'frame',
      name: `Доска 50×${internalWallThickness} для обвязки внутренних стен`,
      quantity: Math.ceil(internalBindingVolume * 1000),
      unit: 'п.м.',
      notes: 'Верхняя и нижняя обвязка',
    });
  }
  
  // ===== ЧЕРНОВОЙ ПОЛ =====
  // ОСП или фанера на лаги
  const subfloorArea = houseArea * floors;
  const subfloorSheets = Math.ceil(subfloorArea / CALCULATION_CONSTANTS.OSB_SHEET_AREA * CALCULATION_CONSTANTS.WASTE_FACTOR);
  
  materials.push({
    category: 'frame',
    name: 'ОСП-3 18мм для чернового пола',
    quantity: subfloorSheets,
    unit: 'лист',
    notes: '1250×2500 мм',
  });
  
  // ===== ПЕРЕКРЫТИЕ =====
  if (floors > 1) {
    // Балки перекрытия
    const ceilingJoists = joistsPerFloor;
    const ceilingJoistLength = ceilingJoists * length;
    const ceilingJoistVolume = ceilingJoistLength * studWidth * joistDepth;
    
    materials.push({
      category: 'frame',
      name: 'Доска 50×200 для балок перекрытия',
      quantity: Math.ceil(ceilingJoistVolume * 1000),
      unit: 'п.м.',
      notes: 'Межэтажное перекрытие',
    });
    
    // ОСП на потолок нижнего этажа
    const ceilingSheets = Math.ceil(houseArea / CALCULATION_CONSTANTS.OSB_SHEET_AREA * CALCULATION_CONSTANTS.WASTE_FACTOR);
    materials.push({
      category: 'frame',
      name: 'ОСП-3 12мм для потолка',
      quantity: ceilingSheets,
      unit: 'лист',
      notes: 'Подшивка потолка',
    });
  }
  
  // ===== МАНСАРДА =====
  if (hasAttic) {
    // Стойки стен мансарды (пониженные)
    const atticWallHeight = 1.5; // высота стен мансарды
    const atticStuds = Math.ceil(perimeter / studSpacingM);
    const atticStudLength = atticStuds * atticWallHeight;
    const atticStudVolume = atticStudLength * studWidth * studDepth;
    
    materials.push({
      category: 'frame',
      name: `Доска 50×${externalWallThickness} для стоек мансарды`,
      quantity: Math.ceil(atticStudVolume * 1000),
      unit: 'п.м.',
      notes: 'Стены мансарды',
    });
  }
  
  // ===== УГОЛКИ МЕТАЛЛИЧЕСКИЕ =====
  const cornerPlates = totalExternalStuds * 2; // по 2 уголка на стойку
  const joistPlates = totalJoists * 2; // по 2 уголка на лагу
  
  materials.push({
    category: 'frame',
    name: 'Уголки металлические усиленные',
    quantity: cornerPlates + joistPlates,
    unit: 'шт',
    notes: 'Крепление стоек и лаг',
  });
  
  // ===== ГВООЗДИ =====
  const wallArea = perimeter * floorHeight * floors;
  const nailsKg = wallArea * CALCULATION_CONSTANTS.NAILS_PER_SQM_WALL;
  
  materials.push({
    category: 'frame',
    name: 'Гвозди строительные 90мм',
    quantity: Math.ceil(nailsKg),
    unit: 'кг',
    notes: 'Сборка каркаса',
  });
  
  return materials;
}

// Расчёт стропильной системы (часть каркаса)
export function calculateRoofFrame(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const { length, width, roofType, roofAngle, hasAttic } = params;
  
  // Длина ската по теореме Пифагора
  const angleRad = (roofAngle * Math.PI) / 180;
  const halfWidth = width / 2;
  
  let totalRafterLength = 0;
  let roofArea = 0;
  let numberOfSlopes = 0;
  
  switch (roofType) {
    case 'gable': {
      // Двускатная крыша
      const rafterLength = halfWidth / Math.cos(angleRad);
      numberOfSlopes = 2;
      totalRafterLength = rafterLength * 2;
      roofArea = length * rafterLength * 2;
      break;
    }
    case 'shed': {
      // Односкатная крыша
      const rafterLength = width / Math.cos(angleRad);
      numberOfSlopes = 1;
      totalRafterLength = rafterLength;
      roofArea = length * rafterLength;
      break;
    }
    case 'hip': {
      // Вальмовая крыша
      const rafterLength = halfWidth / Math.cos(angleRad);
      const hipRafterLength = Math.sqrt(Math.pow(halfWidth, 2) + Math.pow(halfWidth / Math.cos(angleRad), 2));
      numberOfSlopes = 4;
      totalRafterLength = rafterLength * 2 + hipRafterLength * 2;
      roofArea = (length * rafterLength * 2) + (halfWidth * rafterLength * 2);
      break;
    }
  }
  
  // ===== СТРОПИЛА =====
  const rafterSpacing = CALCULATION_CONSTANTS.DEFAULT_RAFTER_SPACING;
  const raftersPerSlope = Math.ceil(length / rafterSpacing) + 1;
  const totalRafters = raftersPerSlope * numberOfSlopes;
  const rafterTotalLength = totalRafters * totalRafterLength;
  
  const rafterWidth = CALCULATION_CONSTANTS.STUD_WIDTH;
  const rafterDepth = CALCULATION_CONSTANTS.STUD_DEPTH_THICK;
  const rafterVolume = rafterTotalLength * rafterWidth * rafterDepth;
  
  materials.push({
    category: 'frame',
    name: 'Доска 50×200 для стропил',
    quantity: Math.ceil(rafterTotalLength * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'п.м.',
    notes: `Объём: ${rafterVolume.toFixed(2)} м³`,
  });
  
  // ===== МАУЭРЛАТ =====
  const perimeter = 2 * (length + width);
  const mauerlatLength = perimeter;
  const mauerlatVolume = mauerlatLength * rafterWidth * rafterDepth;
  
  materials.push({
    category: 'frame',
    name: 'Доска 50×200 для мауэрлата',
    quantity: Math.ceil(mauerlatLength * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'п.м.',
    notes: 'Опорная балка под стропила',
  });
  
  // ===== КОНЬКОВЫЙ БРУС (для двускатной и вальмовой) =====
  if (roofType === 'gable' || roofType === 'hip') {
    materials.push({
      category: 'frame',
      name: 'Брус 100×200 для конька',
      quantity: Math.ceil(length * CALCULATION_CONSTANTS.WASTE_FACTOR),
      unit: 'п.м.',
      notes: 'Коньковая балка',
    });
  }
  
  // ===== ОБРЕШЁТКА =====
  const battenWidth = CALCULATION_CONSTANTS.BATTEN_WIDTH;
  const battenDepth = CALCULATION_CONSTANTS.BATTEN_DEPTH;
  const battenSpacing = 0.3; // шаг обрешётки
  const battenRows = Math.ceil(totalRafterLength / battenSpacing) + 1;
  const battenLength = length * battenRows * numberOfSlopes;
  const battenVolume = battenLength * battenWidth * battenDepth;
  
  materials.push({
    category: 'frame',
    name: 'Доска 25×100 для обрешётки',
    quantity: Math.ceil(battenLength * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'п.м.',
    notes: `Объём: ${battenVolume.toFixed(2)} м³`,
  });
  
  // ===== КОНТРОБРЕШЁТКА =====
  const counterBattenLength = totalRafterLength * totalRafters * 0.05 / battenWidth; // брусок 50×50 вдоль стропил
  materials.push({
    category: 'frame',
    name: 'Брусок 50×50 для контробрешётки',
    quantity: Math.ceil(totalRafterLength * raftersPerSlope * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'п.м.',
    notes: 'Вдоль стропил для вентиляции',
  });
  
  // ===== СТОЙКИ ПОД КОНЁК (для мансарды) =====
  if (hasAttic || roofType === 'gable') {
    const ridgePosts = Math.ceil(length / 2); // стойки каждые 2 м
    const postHeight = halfWidth * Math.tan(angleRad);
    
    materials.push({
      category: 'frame',
      name: 'Брус 100×100 для стоек конька',
      quantity: Math.ceil(ridgePosts * postHeight * CALCULATION_CONSTANTS.WASTE_FACTOR),
      unit: 'п.м.',
      notes: 'Опоры под коньковую балку',
    });
  }
  
  // ===== УГОЛКИ ДЛЯ СТРОПИЛ =====
  materials.push({
    category: 'frame',
    name: 'Уголки металлические для стропил',
    quantity: totalRafters * 2,
    unit: 'шт',
    notes: 'Крепление стропил к мауэрлату',
  });
  
  return materials;
}

// Экспорт общей площади крыши для использования в других модулях
export function getRoofArea(params: HouseParams): number {
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
