// Расчёт материалов для домов из железобетонных плит
import { HouseParams, MaterialItem, CALCULATION_CONSTANTS } from '../../types';

export function calculateConcreteSlab(params: HouseParams): MaterialItem[] {
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
  
  // ===== СТЕНЫ ИЗ Ж/Б ПЛИТ =====
  
  // Толщина стены
  const wallThickness = (externalWallThickness || 220) / 1000;
  
  // Расчёт плит для стен
  // Стандартная ширина плиты 1.5 м, высота 2.8-3.0 м
  const slabHeight = floorHeight;
  const slabWidth = 1.5; // стандартная ширина
  
  // Количество плит по периметру
  const slabsPerRow = Math.ceil(perimeter / slabWidth);
  const totalWallSlabs = slabsPerRow * floors;
  
  // Определяем размер плит
  materials.push({
    category: 'concrete_slab',
    name: 'Плита ПК 60-15-8 (6000×1500×220)',
    quantity: Math.ceil(totalWallSlabs * 0.7),
    unit: 'шт',
    notes: `Стеновые плиты, площадь: ${Math.ceil(wallArea)} м²`,
  });
  
  // Доборные элементы
  materials.push({
    category: 'concrete_slab',
    name: 'Плита ПК 42-15-8 (4200×1500×220)',
    quantity: Math.ceil(totalWallSlabs * 0.2),
    unit: 'шт',
    notes: 'Доборные плиты',
  });
  
  materials.push({
    category: 'concrete_slab',
    name: 'Плита ПК 30-15-8 (3000×1500×220)',
    quantity: Math.ceil(totalWallSlabs * 0.1),
    unit: 'шт',
    notes: 'Доборы для проёмов',
  });
  
  // ===== ПЕРЕКРЫТИЯ =====
  
  const floorArea = houseArea * floors;
  
  // Плиты перекрытия
  materials.push({
    category: 'concrete_slab',
    name: 'Плита ПК 60-15-8 (6000×1500×220)',
    quantity: Math.ceil(floorArea / 9), // 6×1.5 = 9 м²
    unit: 'шт',
    notes: 'Плиты перекрытия',
  });
  
  // Цементный раствор для швов
  const mortarVolume = Math.ceil((totalWallSlabs + floorArea / 9) * 0.05);
  materials.push({
    category: 'concrete_slab',
    name: 'Цементный раствор М150',
    quantity: mortarVolume,
    unit: 'м³',
    notes: 'Заделка швов между плитами',
  });
  
  // ===== АРМАТУРА И КРЕПЁЖ =====
  
  // Арматура для связки плит
  const rebarLength = perimeter * 4 * floors;
  materials.push({
    category: 'fasteners',
    name: 'Арматура для связки плит Ø12мм',
    quantity: Math.ceil(rebarLength),
    unit: 'п.м.',
    notes: 'Связка плит арматурой',
  });
  
  // Сварка
  const electrodes = Math.ceil((totalWallSlabs + floorArea / 9) * 0.5);
  materials.push({
    category: 'fasteners',
    name: 'Электроды сварочные МР-3',
    quantity: electrodes,
    unit: 'кг',
    notes: 'Сварка закладных деталей',
  });
  
  // Анкеры
  const anchors = Math.ceil(totalWallSlabs * 2);
  materials.push({
    category: 'fasteners',
    name: 'Анкеры фундаментные',
    quantity: anchors,
    unit: 'шт',
    notes: 'Крепление стеновых плит',
  });
  
  // ===== ГЕРМЕТИЗАЦИЯ =====
  
  // Герметик для швов
  const sealantLength = (totalWallSlabs + floorArea / 9) * 4; // 4 шва на плиту
  materials.push({
    category: 'concrete_slab',
    name: 'Герметик полиуретановый',
    quantity: Math.ceil(sealantLength / 10), // 10 м с баллона
    unit: 'баллон',
    notes: 'Герметизация швов',
  });
  
  // ===== УТЕПЛЕНИЕ =====
  
  const insulationArea = wallArea * 1.05;
  
  // Утеплитель изнутри
  materials.push({
    category: 'insulation',
    name: 'Минеральная вата для стен',
    quantity: Math.ceil(insulationArea),
    unit: 'м²',
    notes: 'Внутреннее утепление 150мм',
  });
  
  // Пароизоляция
  materials.push({
    category: 'insulation',
    name: 'Плёнка пароизоляционная',
    quantity: Math.ceil(insulationArea * 1.1),
    unit: 'м²',
    notes: 'Пароизоляция',
  });
  
  // ===== ВНУТРЕННЯЯ ОТДЕЛКА =====
  
  // Гипсокартон на каркас
  const gklArea = wallArea * 2 + houseArea * floors * 2;
  materials.push({
    category: 'finish',
    name: 'Гипсокартон обычный 12.5мм',
    quantity: Math.ceil(gklArea / 3),
    unit: 'лист',
    notes: 'Внутренняя обшивка',
  });
  
  // Профиль для ГКЛ
  const profileLength = gklArea * 3;
  materials.push({
    category: 'finish',
    name: 'Профиль CD 60×27',
    quantity: Math.ceil(profileLength * 0.7),
    unit: 'п.м.',
    notes: 'Каркас под ГКЛ',
  });
  
  materials.push({
    category: 'finish',
    name: 'Профиль UD 28×27',
    quantity: Math.ceil(profileLength * 0.3),
    unit: 'п.м.',
    notes: 'Направляющий профиль',
  });
  
  // ===== КРОВЛЯ =====
  
  const roofAngleRad = (params.roofAngle || 30) * Math.PI / 180;
  const roofWidth = width / Math.cos(roofAngleRad) * 1.1;
  
  let roofArea = 0;
  if (params.roofType === 'gable') {
    roofArea = 2 * length * roofWidth;
  } else if (params.roofType === 'hip') {
    roofArea = 2 * length * roofWidth * 1.1;
  } else {
    roofArea = length * roofWidth;
  }
  
  // Плоская крыша из плит (опционально)
  if (params.roofType === 'shed') {
    materials.push({
      category: 'roof',
      name: 'Плита ПК 60-15-8 (6000×1500×220)',
      quantity: Math.ceil(roofArea / 9),
      unit: 'шт',
      notes: 'Плита для плоской крыши',
    });
    
    // Гидроизоляция плоской крыши
    materials.push({
      category: 'roof',
      name: 'Гидроизоляция рулонная',
      quantity: Math.ceil(roofArea * 1.1),
      unit: 'м²',
      notes: 'Гидроизоляция плоской крыши',
    });
  } else {
    // Стропильная система
    const rafters = Math.ceil(length / 0.8) + 1;
    const rafterLength = roofWidth * 2 * rafters;
    
    materials.push({
      category: 'roof',
      name: 'Брус 100×200',
      quantity: Math.ceil(rafterLength),
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
        notes: 'Кровельное покрытие',
      });
    } else {
      materials.push({
        category: 'roof',
        name: 'Профнастил С20',
        quantity: Math.ceil(roofArea * 1.1),
        unit: 'м²',
        notes: 'Кровельное покрытие',
      });
    }
  }
  
  return materials;
}
