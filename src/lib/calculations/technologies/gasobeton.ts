// Расчёт материалов для газобетонных домов
import { HouseParams, MaterialItem, CALCULATION_CONSTANTS } from '../../types';

export function calculateGasobeton(params: HouseParams): MaterialItem[] {
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
  
  // Толщина стены (мм -> м)
  const wallThickness = (externalWallThickness || 375) / 1000;
  
  // Объём газобетона для внешних стен
  const wallVolume = wallArea * wallThickness * CALCULATION_CONSTANTS.WASTE_FACTOR;
  
  // ===== СТЕНЫ ИЗ ГАЗОБЕТОНА =====
  
  // Определяем плотность
  const density = params.gasobetonDensity || 500;
  
  if (wallThickness <= 0.2) {
    materials.push({
      category: 'gasobeton',
      name: `Газоблок D${density} 200×250×625мм`,
      quantity: Math.ceil(wallVolume),
      unit: 'м³',
      notes: `Площадь стен: ${Math.ceil(wallArea)} м²`,
    });
  } else if (wallThickness <= 0.3) {
    materials.push({
      category: 'gasobeton',
      name: `Газоблок D${density} 300×250×625мм`,
      quantity: Math.ceil(wallVolume),
      unit: 'м³',
      notes: `Площадь стен: ${Math.ceil(wallArea)} м²`,
    });
  } else if (wallThickness <= 0.375) {
    materials.push({
      category: 'gasobeton',
      name: `Газоблок D${density} 375×250×625мм`,
      quantity: Math.ceil(wallVolume),
      unit: 'м³',
      notes: `Площадь стен: ${Math.ceil(wallArea)} м²`,
    });
  } else {
    materials.push({
      category: 'gasobeton',
      name: `Газоблок D${density} 400×250×600мм`,
      quantity: Math.ceil(wallVolume),
      unit: 'м³',
      notes: `Площадь стен: ${Math.ceil(wallArea)} м²`,
    });
  }
  
  // Внутренние перегородки из газобетона 100мм
  const internalWallArea = (params.internalWalls || 0) * floorHeight * floors;
  const internalWallVolume = internalWallArea * 0.1 * CALCULATION_CONSTANTS.WASTE_FACTOR;
  
  if (internalWallVolume > 0) {
    materials.push({
      category: 'gasobeton',
      name: 'Газоблок D500 100×250×625мм',
      quantity: Math.ceil(internalWallVolume),
      unit: 'м³',
      notes: 'Внутренние перегородки',
    });
  }
  
  // ===== КЛЕЙ ДЛЯ ГАЗОБЕТОНА =====
  
  // Расход клея: ~25 кг на 1 м³ газобетона
  const glueBags = Math.ceil((wallVolume + internalWallVolume) * 0.8); // 0.8 мешка на м³
  materials.push({
    category: 'gasobeton',
    name: 'Клей для газобетона',
    quantity: glueBags,
    unit: 'мешок 25кг',
    notes: 'Тонкошовная кладка',
  });
  
  // ===== АРМИРОВАНИЕ =====
  
  // Арматура для армопояса (по периметру на каждом этаже)
  const rebarLength = perimeter * 4 * floors; // 4 прутка в поясе
  materials.push({
    category: 'gasobeton',
    name: 'Арматура для газобетона Ø8мм',
    quantity: Math.ceil(rebarLength),
    unit: 'п.м.',
    notes: 'Армопояс под перекрытие',
  });
  
  // Армирующая сетка (кладочная сетка каждые 3 ряда)
  const meshArea = wallArea / 3 * 0.6 * 0.6; // примерно 60% площади через каждые 3 ряда
  materials.push({
    category: 'gasobeton',
    name: 'Армирующая сетка для газобетона',
    quantity: Math.ceil(meshArea),
    unit: 'м²',
    notes: 'Через каждые 3 ряда блоков',
  });
  
  // ===== ПЕРЕМЫЧКИ =====
  
  // Перемычки над проёмами
  const totalOpenings = (params.smallWindows + params.mediumWindows + params.largeWindows + params.externalDoors) * floors;
  materials.push({
    category: 'gasobeton',
    name: 'U-блоки газобетонные',
    quantity: Math.ceil(totalOpenings * 2),
    unit: 'шт',
    notes: 'Для перемычек над проёмами',
  });
  
  materials.push({
    category: 'gasobeton',
    name: 'Перемычки газобетонные',
    quantity: Math.ceil(totalOpenings),
    unit: 'шт',
    notes: 'Готовые перемычки',
  });
  
  // ===== ПЕРЕКРЫТИЯ =====
  
  // Ж/Б плиты перекрытия
  const floorArea = houseArea * floors;
  materials.push({
    category: 'concrete_slab',
    name: 'Плита пустотная средняя',
    quantity: Math.ceil(floorArea),
    unit: 'м²',
    notes: 'Многопустотные плиты',
  });
  
  // Бетон для заливки армопояса
  const beltVolume = perimeter * 0.2 * 0.25 * floors; // 200×250 мм пояс
  materials.push({
    category: 'gasobeton',
    name: 'Бетон М300',
    quantity: Math.ceil(beltVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'м³',
    notes: 'Для армопояса',
  });
  
  // ===== УТЕПЛЕНИЕ И ОТДЕЛКА =====
  
  // Утеплитель для фасада (если требуется)
  const insulationArea = wallArea * 1.05;
  materials.push({
    category: 'insulation',
    name: 'Пенополистирол экструдированный 50мм',
    quantity: Math.ceil(insulationArea),
    unit: 'м²',
    notes: 'Фасадное утепление',
  });
  
  // Тарельчатые дюбели для утеплителя
  materials.push({
    category: 'fasteners',
    name: 'Тарельчатые дюбели',
    quantity: Math.ceil(insulationArea * 6),
    unit: 'шт',
    notes: 'Крепление утеплителя',
  });
  
  // Штукатурка фасадная
  materials.push({
    category: 'finish',
    name: 'Штукатурка фасадная',
    quantity: Math.ceil(insulationArea / 4), // ~4 м² с мешка
    unit: 'мешок 25кг',
    notes: 'Фасадная отделка',
  });
  
  materials.push({
    category: 'finish',
    name: 'Грунтовка фасадная',
    quantity: Math.ceil(insulationArea / 10),
    unit: 'л',
    notes: 'Грунтование фасада',
  });
  
  // Сетка штукатурная
  materials.push({
    category: 'finish',
    name: 'Сетка штукатурная',
    quantity: Math.ceil(insulationArea),
    unit: 'м²',
    notes: 'Армирование штукатурки',
  });
  
  return materials;
}
