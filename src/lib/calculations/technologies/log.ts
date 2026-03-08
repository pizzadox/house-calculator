// Расчёт материалов для бревенчатых домов (срубов)
import { HouseParams, MaterialItem, CALCULATION_CONSTANTS } from '../../types';

export function calculateLogHouse(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const { length, width, floorHeight, floors, hasAttic } = params;
  
  const perimeter = 2 * (length + width);
  const houseArea = length * width;
  
  // Диаметр бревна (мм)
  const logDiameter = params.logDiameter || 220;
  const logRadiusM = logDiameter / 1000 / 2;
  
  // Площадь стен (без проёмов для начала)
  const windowsArea = 
    params.smallWindows * CALCULATION_CONSTANTS.SMALL_WINDOW_AREA +
    params.mediumWindows * CALCULATION_CONSTANTS.MEDIUM_WINDOW_AREA +
    params.largeWindows * CALCULATION_CONSTANTS.LARGE_WINDOW_AREA;
  const doorsArea = params.externalDoors * CALCULATION_CONSTANTS.EXTERNAL_DOOR_AREA;
  const totalOpeningsArea = (windowsArea + doorsArea) * floors;
  
  const wallArea = perimeter * floorHeight * floors - totalOpeningsArea;
  
  // Высота бревна с учётом паза (лунный паз)
  const effectiveLogHeight = logDiameter * 0.85 / 1000; // 85% от диаметра
  
  // Количество венцов (рядов брёвен)
  const totalHeight = floorHeight * floors;
  const crownsCount = Math.ceil(totalHeight / effectiveLogHeight);
  
  // ===== ОЦИЛИНДРОВАННОЕ БРЕВНО =====
  
  // Объём бревна на стены
  // Формула: π × r² × L для каждого бревна
  const logsPerRow = Math.ceil(perimeter / 6); // бревна по 6м
  const totalLogs = logsPerRow * crownsCount;
  
  // Средняя длина бревна с учётом перерубов
  const avgLogLength = perimeter / logsPerRow;
  const logVolume = Math.PI * Math.pow(logRadiusM, 2) * avgLogLength;
  const totalLogVolume = logVolume * totalLogs * CALCULATION_CONSTANTS.WASTE_FACTOR;
  
  if (logDiameter <= 180) {
    materials.push({
      category: 'log',
      name: 'Оцилиндрованное бревно Ø180мм',
      quantity: Math.ceil(totalLogVolume),
      unit: 'м³',
      notes: `${crownsCount} венцов, ${totalLogs} бревен`,
    });
  } else if (logDiameter <= 200) {
    materials.push({
      category: 'log',
      name: 'Оцилиндрованное бревно Ø200мм',
      quantity: Math.ceil(totalLogVolume),
      unit: 'м³',
      notes: `${crownsCount} венцов, ${totalLogs} бревен`,
    });
  } else if (logDiameter <= 220) {
    materials.push({
      category: 'log',
      name: 'Оцилиндрованное бревно Ø220мм',
      quantity: Math.ceil(totalLogVolume),
      unit: 'м³',
      notes: `${crownsCount} венцов, ${totalLogs} бревен`,
    });
  } else if (logDiameter <= 240) {
    materials.push({
      category: 'log',
      name: 'Оцилиндрованное бревно Ø240мм',
      quantity: Math.ceil(totalLogVolume),
      unit: 'м³',
      notes: `${crownsCount} венцов, ${totalLogs} бревен`,
    });
  } else if (logDiameter <= 260) {
    materials.push({
      category: 'log',
      name: 'Оцилиндрованное бревно Ø260мм',
      quantity: Math.ceil(totalLogVolume),
      unit: 'м³',
      notes: `${crownsCount} венцов, ${totalLogs} бревен`,
    });
  } else {
    materials.push({
      category: 'log',
      name: 'Оцилиндрованное бревно Ø280мм',
      quantity: Math.ceil(totalLogVolume),
      unit: 'м³',
      notes: `${crownsCount} венцов, ${totalLogs} бревен`,
    });
  }
  
  // ===== БАЛКИ ПЕРЕКРЫТИЯ =====
  
  const beamSpacing = 0.8; // шаг балок
  const beamCount = Math.ceil(width / beamSpacing) + 1;
  const beamLength = length + 0.5; // с выпусками в стены
  const beamHeight = 0.2; // 200мм
  const beamWidth = 0.1; // 100мм
  
  const beamVolume = beamHeight * beamWidth * beamLength * beamCount * floors;
  
  materials.push({
    category: 'log',
    name: 'Брус 100×200',
    quantity: Math.ceil(beamVolume),
    unit: 'м³',
    notes: 'Балки перекрытия',
  });
  
  // ===== МЕЖВЕНЦОВЫЙ УТЕПЛИТЕЛЬ =====
  
  // Джутовая лента по периметру каждого венца
  const juteLength = perimeter * crownsCount * 2; // двойной слой
  
  materials.push({
    category: 'log',
    name: 'Джут для межвенцового утепления',
    quantity: Math.ceil(juteLength),
    unit: 'п.м.',
    notes: 'Межвенцовый утеплитель',
  });
  
  // ===== НАГЕЛИ (ШКАНТЫ) =====
  
  // Нагели для скрепления венцов (через 1.5-2м)
  const nagelSpacing = 1.5;
  const nagelsPerRow = Math.ceil(perimeter / nagelSpacing);
  const totalNagels = nagelsPerRow * crownsCount;
  
  materials.push({
    category: 'log',
    name: 'Нагели деревянные Ø25мм',
    quantity: Math.ceil(totalNagels),
    unit: 'шт',
    notes: 'Сборка сруба',
  });
  
  // ===== КОНИАТКА (УСАДКА) =====
  
  // Мох для конопатки после усадки
  materials.push({
    category: 'log',
    name: 'Мох для конопатки',
    quantity: Math.ceil(totalLogVolume * 2),
    unit: 'мешок',
    notes: 'Конопатка после усадки',
  });
  
  // ===== ПОЛ =====
  
  // Черновой пол
  materials.push({
    category: 'log',
    name: 'Черновой пол из доски 25×150',
    quantity: Math.ceil(houseArea * floors * 1.1),
    unit: 'м²',
    notes: 'Настил по балкам',
  });
  
  // Чистовой пол
  materials.push({
    category: 'log',
    name: 'Половая доска камерной сушки 36мм',
    quantity: Math.ceil(houseArea * floors * 1.05),
    unit: 'м²',
    notes: 'Чистовой пол',
  });
  
  // ===== ПОТОЛОК =====
  
  // Обшивка потолка вагонкой
  materials.push({
    category: 'finish',
    name: 'Вагонка евростандарт',
    quantity: Math.ceil(houseArea * floors * 1.1),
    unit: 'м²',
    notes: 'Обшивка потолка',
  });
  
  // Плинтус потолочный
  const plinear = (perimeter + (params.internalWalls || 0) * 2) * floors;
  materials.push({
    category: 'finish',
    name: 'Плинтус потолочный из дерева',
    quantity: Math.ceil(plinear * 1.05),
    unit: 'п.м.',
    notes: 'Для потолка',
  });
  
  // Угловой плинтус
  materials.push({
    category: 'finish',
    name: 'Угловой плинтус для сруба',
    quantity: Math.ceil(plinear * 0.3),
    unit: 'п.м.',
    notes: 'Углы и перерубы',
  });
  
  // ===== АНТИСЕПТИК =====
  
  // Обработка бревна
  const exteriorArea = wallArea + houseArea * 2; // внешние стены + свесы
  materials.push({
    category: 'log',
    name: 'Антисептик для бревна',
    quantity: Math.ceil(exteriorArea / 5), // ~5 м² с ведра
    unit: 'ведро 10л',
    notes: 'Защита от гниения',
  });
  
  // Пожарозащитная пропитка
  materials.push({
    category: 'log',
    name: 'Пожарозащитная пропитка',
    quantity: Math.ceil(exteriorArea / 6),
    unit: 'ведро 10л',
    notes: 'Огнезащита',
  });
  
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
  
  // Обрешётка
  materials.push({
    category: 'roof',
    name: 'Доска 25×100',
    quantity: Math.ceil(roofArea * 2 / 0.1 * 0.1), // шаг 100мм
    unit: 'п.м.',
    notes: 'Обрешётка под кровлю',
  });
  
  // Кровельный материал - металлочерепица для сруба
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
  
  // ===== ОКНА И ДВЕРИ (для деревянных домов) =====
  
  // Деревянные окна более уместны
  if (params.smallWindows > 0) {
    materials.push({
      category: 'windows',
      name: 'Окно деревянное малое (600×1000)',
      quantity: params.smallWindows * floors,
      unit: 'шт',
      notes: 'Деревянные стеклопакеты',
    });
  }
  
  if (params.mediumWindows > 0) {
    materials.push({
      category: 'windows',
      name: 'Окно деревянное среднее (1000×1200)',
      quantity: params.mediumWindows * floors,
      unit: 'шт',
      notes: 'Деревянные стеклопакеты',
    });
  }
  
  if (params.largeWindows > 0) {
    materials.push({
      category: 'windows',
      name: 'Окно деревянное большое (1500×1500)',
      quantity: params.largeWindows * floors,
      unit: 'шт',
      notes: 'Деревянные стеклопакеты',
    });
  }
  
  // Входная дверь
  materials.push({
    category: 'windows',
    name: 'Дверь входная деревянная массив',
    quantity: params.externalDoors,
    unit: 'шт',
    notes: 'Деревянная входная дверь',
  });
  
  // Межкомнатные двери
  materials.push({
    category: 'windows',
    name: 'Дверь межкомнатная деревянная',
    quantity: params.internalDoors * floors,
    unit: 'шт',
    notes: 'Филёнчатые двери',
  });
  
  return materials;
}
