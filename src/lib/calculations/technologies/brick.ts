// Расчёт материалов для кирпичных домов
import { HouseParams, MaterialItem, CALCULATION_CONSTANTS } from '../../types';

export function calculateBrick(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const { length, width, floorHeight, floors, externalWallThickness } = params;
  
  const perimeter = 2 * (length + width);
  const houseArea = length * width;
  
  // Площадь стен с учётом проёмов
  const windowsArea = 
    params.smallWindows * CALCULATION_CONSTANTS.SMALL_WINDOW_AREA +
    params.mediumWindows * CALCULATION_CONSTANTS.MEDIUM_WINDOW_AREA +
    params.largeWindows * CALCULATION_CONSTANTS.LARGE_WINDOW_AREA;
  const doorsArea = params.externalDoors * CALCULATION_CONSTANTS.EXTERNAL_DOOR_AREA;
  const totalOpeningsArea = (windowsArea + doorsArea) * floors;
  
  const wallArea = perimeter * floorHeight * floors - totalOpeningsArea;
  
  // Толщина стены в кирпичах
  const wallThicknessMm = externalWallThickness || 510; // 2 кирпича по умолчанию
  
  // ===== КИРПИЧ =====
  
  // Определяем тип кирпича
  const brickType = params.brickType || 'solid';
  
  // Количество кирпичей на 1 м² стены
  let bricksPerSqm: number;
  let wallThicknessInBricks: string;
  
  if (wallThicknessMm <= 250) {
    // В 1 кирпич (250мм)
    bricksPerSqm = CALCULATION_CONSTANTS.BRICKS_PER_SQM_SINGLE;
    wallThicknessInBricks = 'в 1 кирпич';
  } else if (wallThicknessMm <= 380) {
    // В 1.5 кирпича (380мм)
    bricksPerSqm = CALCULATION_CONSTANTS.BRICKS_PER_SQM_DOUBLE;
    wallThicknessInBricks = 'в 1.5 кирпича';
  } else {
    // В 2 кирпича (510мм)
    bricksPerSqm = CALCULATION_CONSTANTS.BRICKS_PER_SQM_TRIPLE;
    wallThicknessInBricks = 'в 2 кирпича';
  }
  
  const totalBricks = Math.ceil(wallArea * bricksPerSqm * CALCULATION_CONSTANTS.WASTE_FACTOR);
  
  // Рядовой кирпич
  if (brickType === 'solid') {
    materials.push({
      category: 'brick',
      name: 'Кирпич рядовой керамический полнотелый',
      quantity: totalBricks,
      unit: 'шт',
      notes: `Стены ${wallThicknessInBricks}, площадь: ${Math.ceil(wallArea)} м²`,
    });
  } else if (brickType === 'hollow') {
    materials.push({
      category: 'brick',
      name: 'Кирпич рядовой керамический пустотелый',
      quantity: totalBricks,
      unit: 'шт',
      notes: `Стены ${wallThicknessInBricks}, площадь: ${Math.ceil(wallArea)} м²`,
    });
  } else {
    // Лицевой кирпич с рядовым
    const facingBricks = Math.ceil(wallArea * 51 * 1.05); // облицовка в полкирпича
    const rowBricks = Math.ceil(wallArea * 102 * 1.05); // забутовка
    
    materials.push({
      category: 'brick',
      name: 'Кирпич облицовочный красный',
      quantity: facingBricks,
      unit: 'шт',
      notes: 'Облицовка фасада',
    });
    
    materials.push({
      category: 'brick',
      name: 'Кирпич силикатный рядовой',
      quantity: rowBricks,
      unit: 'шт',
      notes: 'Забутовка (внутренний слой)',
    });
  }
  
  // ===== РАСТВОР =====
  
  // Объём раствора: ~0.25 м³ на 1 м³ кладки
  const wallVolume = wallArea * (wallThicknessMm / 1000);
  const mortarVolume = wallVolume * 0.25 * CALCULATION_CONSTANTS.WASTE_FACTOR;
  
  materials.push({
    category: 'masonry',
    name: 'Раствор кладочный М100',
    quantity: Math.ceil(mortarVolume),
    unit: 'м³',
    notes: 'Цементно-песчаный раствор',
  });
  
  // ===== АРМИРОВАНИЕ =====
  
  // Кладочная сетка каждые 5 рядов
  const rowsHeight = floorHeight * floors;
  const meshRows = Math.ceil(rowsHeight / (0.065 * 5)); // через каждые 5 рядов
  const meshArea = wallArea / rowsHeight * (0.065 * 5) * meshRows;
  
  materials.push({
    category: 'masonry',
    name: 'Сетка кладочная 50×50×4мм',
    quantity: Math.ceil(meshArea),
    unit: 'м²',
    notes: 'Армирование кладки',
  });
  
  // ===== АРМОПОЯС =====
  
  // Арматура для армопояса
  const beltRebarLength = perimeter * 4 * floors;
  materials.push({
    category: 'masonry',
    name: 'Арматура для армопояса Ø10мм',
    quantity: Math.ceil(beltRebarLength),
    unit: 'п.м.',
    notes: 'Армопояс под перекрытие',
  });
  
  // Бетон для армопояса
  const beltVolume = perimeter * 0.25 * 0.2 * floors; // 250×200 мм
  materials.push({
    category: 'masonry',
    name: 'Бетон М300',
    quantity: Math.ceil(beltVolume),
    unit: 'м³',
    notes: 'Для армопояса',
  });
  
  // ===== ПЕРЕМЫЧКИ =====
  
  // Перемычки над проёмами
  const totalOpenings = (params.smallWindows + params.mediumWindows + params.largeWindows + params.externalDoors) * floors;
  
  materials.push({
    category: 'masonry',
    name: 'Перемычки железобетонные для проёмов',
    quantity: Math.ceil(totalOpenings),
    unit: 'шт',
    notes: 'Над оконными и дверными проёмами',
  });
  
  // Уголки для перемычек (альтернатива)
  materials.push({
    category: 'masonry',
    name: 'Уголки для перемычек 100×100×7мм',
    quantity: Math.ceil(totalOpenings * 2.5),
    unit: 'п.м.',
    notes: 'Для усиления проёмов',
  });
  
  // ===== ПЕРЕКРЫТИЯ =====
  
  const floorArea = houseArea * floors;
  
  // Ж/Б плиты перекрытия
  materials.push({
    category: 'concrete_slab',
    name: 'Плита пустотная средняя',
    quantity: Math.ceil(floorArea),
    unit: 'м²',
    notes: 'Многопустотные плиты',
  });
  
  // Цементный раствор для заделки швов
  materials.push({
    category: 'masonry',
    name: 'Цементный раствор М150',
    quantity: Math.ceil(floorArea / 50), // примерно
    unit: 'м³',
    notes: 'Заделка швов плит',
  });
  
  // ===== УТЕПЛЕНИЕ =====
  
  // Утеплитель (если колодцевая кладка или внутреннее утепление)
  const insulationArea = wallArea * 1.05;
  
  if (brickType === 'facing') {
    // Колодцевая кладка - утеплитель между слоями
    materials.push({
      category: 'insulation',
      name: 'Утеплитель для колодцевой кладки 50мм',
      quantity: Math.ceil(insulationArea),
      unit: 'м²',
      notes: 'Между облицовкой и забутовкой',
    });
    
    // Гибкие связи
    materials.push({
      category: 'masonry',
      name: 'Гибкие связи для облицовки',
      quantity: Math.ceil(insulationArea * 5),
      unit: 'шт',
      notes: 'Связь слоёв кладки',
    });
  } else {
    // Внутреннее утепление
    materials.push({
      category: 'insulation',
      name: 'Минеральная вата для стен',
      quantity: Math.ceil(insulationArea),
      unit: 'м²',
      notes: 'Внутреннее утепление 150мм',
    });
    
    materials.push({
      category: 'insulation',
      name: 'Плёнка пароизоляционная',
      quantity: Math.ceil(insulationArea * 1.1),
      unit: 'м²',
      notes: 'Пароизоляция',
    });
  }
  
  // ===== ВНУТРЕННЯЯ ОТДЕЛКА =====
  
  // Штукатурка стен
  const plasterArea = wallArea * 2;
  materials.push({
    category: 'finish',
    name: 'Штукатурка гипсовая',
    quantity: Math.ceil(plasterArea / 4),
    unit: 'мешок 30кг',
    notes: 'Внутренняя штукатурка',
  });
  
  // Грунтовка
  materials.push({
    category: 'finish',
    name: 'Грунтовка глубокого проникновения',
    quantity: Math.ceil(plasterArea / 10),
    unit: 'л',
    notes: 'Перед штукатуркой',
  });
  
  // Гипсокартон (частично)
  materials.push({
    category: 'finish',
    name: 'Гипсокартон обычный 12.5мм',
    quantity: Math.ceil(houseArea * floors / 3),
    unit: 'лист',
    notes: 'Для перегородок и потолков',
  });
  
  // ===== ВНУТРЕННИЕ ПЕРЕГОРОДКИ =====
  
  const internalWallArea = (params.internalWalls || 0) * floorHeight * floors;
  
  if (internalWallArea > 0) {
    // Газосиликатные блоки для перегородок
    materials.push({
      category: 'gasobeton',
      name: 'Газосиликатный блок для перегородок 100мм',
      quantity: Math.ceil(internalWallArea * 51 * 1.05),
      unit: 'шт',
      notes: 'Внутренние перегородки',
    });
  }
  
  // ===== КРОВЛЯ =====
  
  const roofAngleRad = (params.roofAngle || 30) * Math.PI / 180;
  const roofWidth = width / Math.cos(roofAngleRad) * 1.2;
  
  let roofArea = 0;
  if (params.roofType === 'gable') {
    roofArea = 2 * length * roofWidth;
  } else if (params.roofType === 'hip') {
    roofArea = 2 * length * roofWidth * 1.1;
  } else {
    roofArea = length * roofWidth;
  }
  
  // Стропильная система
  const rafterCount = Math.ceil(length / 0.8) + 1;
  const rafterLength = roofWidth * 2;
  
  materials.push({
    category: 'roof',
    name: 'Доска 50×150',
    quantity: Math.ceil(rafterLength * rafterCount * 2),
    unit: 'п.м.',
    notes: 'Стропильная система',
  });
  
  // Кровельный материал
  const roofingMaterial = params.roofingMaterial || 'metal';
  if (roofingMaterial === 'metal') {
    materials.push({
      category: 'roof',
      name: 'Металлочерепица',
      quantity: Math.ceil(roofArea * 1.1),
      unit: 'м²',
      notes: 'Кровельное покрытие',
    });
  } else if (roofingMaterial === 'shingle') {
    materials.push({
      category: 'roof',
      name: 'Гибкая черепица',
      quantity: Math.ceil(roofArea * 1.1),
      unit: 'м²',
      notes: 'Мягкая кровля',
    });
  } else {
    materials.push({
      category: 'roof',
      name: 'Профнастил С20',
      quantity: Math.ceil(roofArea * 1.1),
      unit: 'м²',
      notes: 'Профилированный лист',
    });
  }
  
  // Конёк и планки
  const ridgeLength = length * 2;
  materials.push({
    category: 'roof',
    name: 'Конёк полукруглый',
    quantity: Math.ceil(ridgeLength),
    unit: 'п.м.',
    notes: 'Конёк крыши',
  });
  
  materials.push({
    category: 'roof',
    name: 'Планка карнизная',
    quantity: Math.ceil(length * 2),
    unit: 'п.м.',
    notes: 'Карнизы',
  });
  
  // ===== ФУНДАМЕНТ (усиленный для кирпича) =====
  
  // Ленточный фундамент с увеличенной шириной
  const foundationWidth = 0.5; // 500мм для кирпича
  const foundationDepth = params.foundationDepth || 1.2;
  const foundationVolume = perimeter * foundationWidth * foundationDepth;
  
  materials.push({
    category: 'foundation',
    name: 'Бетон М300',
    quantity: Math.ceil(foundationVolume * 1.1),
    unit: 'м³',
    notes: 'Ленточный фундамент',
  });
  
  // Арматура
  const foundationRebar = perimeter * 6 * 2; // 6 прутков в 2 пояса
  materials.push({
    category: 'foundation',
    name: 'Арматура Ø12мм',
    quantity: Math.ceil(foundationRebar),
    unit: 'п.м.',
    notes: 'Армирование фундамента',
  });
  
  return materials;
}
