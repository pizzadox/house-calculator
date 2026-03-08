// Расчёт материалов для крыши
import { HouseParams, MaterialItem, CALCULATION_CONSTANTS } from '../types';

// Названия кровельных материалов
const ROOFING_NAMES: Record<string, string> = {
  metal: 'Металлочерепица',
  shingle: 'Гибкая (битумная) черепица',
  profile: 'Профнастил',
};

export function calculateRoof(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const { length, width, roofType, roofAngle, roofingMaterial } = params;
  
  const angleRad = (roofAngle * Math.PI) / 180;
  const halfWidth = width / 2;
  
  // Расчёт длины ската и площади крыши
  let totalRafterLength = 0;
  let roofArea = 0;
  let numberOfSlopes = 0;
  let ridgeLength = 0;
  let eavesLength = 0;
  let valleyLength = 0;
  
  switch (roofType) {
    case 'gable': {
      const rafterLength = halfWidth / Math.cos(angleRad);
      numberOfSlopes = 2;
      totalRafterLength = rafterLength;
      roofArea = length * rafterLength * 2;
      ridgeLength = length;
      eavesLength = length * 2;
      break;
    }
    case 'shed': {
      const rafterLength = width / Math.cos(angleRad);
      numberOfSlopes = 1;
      totalRafterLength = rafterLength;
      roofArea = length * rafterLength;
      eavesLength = length;
      break;
    }
    case 'hip': {
      const rafterLength = halfWidth / Math.cos(angleRad);
      const hipRafterLength = Math.sqrt(Math.pow(halfWidth / Math.sin(angleRad), 2) + Math.pow(halfWidth, 2));
      numberOfSlopes = 4;
      totalRafterLength = rafterLength;
      roofArea = (length * rafterLength * 2) + (halfWidth * rafterLength * 2);
      ridgeLength = length - width;
      eavesLength = 2 * (length + width);
      valleyLength = Math.sqrt(2) * halfWidth * 4; // 4 ендовы
      break;
    }
  }
  
  // ===== КРОВЕЛЬНЫЙ МАТЕРИАЛ =====
  const roofMaterialArea = roofArea * CALCULATION_CONSTANTS.OVERLAP_FACTOR;
  
  switch (roofingMaterial) {
    case 'metal': {
      // Металлочерепица
      const sheetWidth = 1.19; // полезная ширина листа
      const sheetLength = totalRafterLength + 0.1; // +10 см на свес
      const sheetsCount = Math.ceil(roofArea / sheetWidth / sheetLength);
      
      materials.push({
        category: 'roof',
        name: 'Металлочерепица',
        quantity: Math.ceil(roofMaterialArea),
        unit: 'м²',
        notes: 'С нахлёстом 15%',
      });
      
      // Саморезы для металлочерепицы
      const screws = Math.ceil(roofArea * 8); // 8 саморезов/м²
      materials.push({
        category: 'roof',
        name: 'Саморезы кровельные с EPDM',
        quantity: screws,
        unit: 'шт',
        notes: 'В цвет кровли',
      });
      break;
    }
    
    case 'shingle': {
      // Гибкая черепица
      materials.push({
        category: 'roof',
        name: 'Гибкая черепица',
        quantity: Math.ceil(roofMaterialArea),
        unit: 'м²',
        notes: 'С нахлёстом',
      });
      
      // Битумная мастика
      const mastic = Math.ceil(roofArea / 20); // 1 банка на 20 м²
      materials.push({
        category: 'roof',
        name: 'Мастика битумная',
        quantity: Math.max(1, mastic),
        unit: 'банка',
        notes: 'Герметизация стыков',
      });
      
      // Гвозди для мягкой кровли
      const nails = Math.ceil(roofArea * 10); // 10 гвоздей/м²
      materials.push({
        category: 'roof',
        name: 'Гвозди оцинкованные 30мм',
        quantity: nails,
        unit: 'шт',
        notes: 'Крепление черепицы',
      });
      break;
    }
    
    case 'profile': {
      // Профнастил
      const sheetWidth = 1.0; // полезная ширина
      const sheetsCount = Math.ceil(roofArea / sheetWidth / totalRafterLength);
      
      materials.push({
        category: 'roof',
        name: 'Профнастил С20',
        quantity: Math.ceil(roofMaterialArea),
        unit: 'м²',
        notes: 'С нахлёстом 15%',
      });
      
      // Саморезы для профнастила
      const screws = Math.ceil(roofArea * 6); // 6 саморезов/м²
      materials.push({
        category: 'roof',
        name: 'Саморезы кровельные',
        quantity: screws,
        unit: 'шт',
        notes: 'С EPDM прокладкой',
      });
      break;
    }
  }
  
  // ===== ПОДКРОВЕЛЬНАЯ ГИДРОИЗОЛЯЦИЯ =====
  materials.push({
    category: 'roof',
    name: 'Мембрана диффузионная',
    quantity: Math.ceil(roofArea * CALCULATION_CONSTANTS.OVERLAP_FACTOR),
    unit: 'м²',
    notes: 'С нахлёстом 15%',
  });
  
  // ===== ДОПОЛНИТЕЛЬНЫЕ ЭЛЕМЕНТЫ =====
  
  // Конёк
  if (ridgeLength > 0) {
    materials.push({
      category: 'roof',
      name: 'Конёк полукруглый',
      quantity: Math.ceil(ridgeLength * CALCULATION_CONSTANTS.WASTE_FACTOR),
      unit: 'п.м.',
      notes: 'Длина конька',
    });
    
    // Уплотнитель для конька
    materials.push({
      category: 'roof',
      name: 'Уплотнитель коньковый',
      quantity: Math.ceil(ridgeLength * 2),
      unit: 'п.м.',
      notes: 'С обеих сторон',
    });
  }
  
  // Карнизные планки
  materials.push({
    category: 'roof',
    name: 'Планка карнизная',
    quantity: Math.ceil(eavesLength * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'п.м.',
    notes: 'Свесы кровли',
  });
  
  // Торцевые (ветровые) планки
  const windPlates = roofType === 'gable' ? length * 4 : eavesLength;
  materials.push({
    category: 'roof',
    name: 'Планка торцевая',
    quantity: Math.ceil(windPlates * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'п.м.',
    notes: 'Защита торцов',
  });
  
  // Ендовы (для вальмовой крыши)
  if (valleyLength > 0) {
    materials.push({
      category: 'roof',
      name: 'Планка ендовы нижняя',
      quantity: Math.ceil(valleyLength),
      unit: 'п.м.',
      notes: 'Внутренние углы',
    });
    
    materials.push({
      category: 'roof',
      name: 'Планка ендовы верхняя',
      quantity: Math.ceil(valleyLength),
      unit: 'п.м.',
      notes: 'Декоративная',
    });
  }
  
  // Капельники
  materials.push({
    category: 'roof',
    name: 'Капельник',
    quantity: Math.ceil(eavesLength * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'п.м.',
    notes: 'Для отвода конденсата',
  });
  
  // Снегозадержатели
  const snowGuards = Math.ceil(length / 2) * numberOfSlopes; // каждые 2 м
  materials.push({
    category: 'roof',
    name: 'Снегозадержатели',
    quantity: snowGuards,
    unit: 'шт',
    notes: 'Вдоль скатов',
  });
  
  // Лестница кровельная
  materials.push({
    category: 'roof',
    name: 'Лестница кровельная',
    quantity: 1,
    unit: 'шт',
    notes: 'Для обслуживания',
  });
  
  // Водосточная система
  // Трубы каждые 10 м по периметру
  const downspoutsCount = Math.ceil(eavesLength / 10);
  
  materials.push({
    category: 'roof',
    name: 'Жёлоб водосточный',
    quantity: Math.ceil(eavesLength * CALCULATION_CONSTANTS.WASTE_FACTOR),
    unit: 'п.м.',
    notes: 'По периметру свесов',
  });
  
  materials.push({
    category: 'roof',
    name: 'Труба водосточная',
    quantity: downspoutsCount,
    unit: 'компл',
    notes: 'С креплениями',
  });
  
  materials.push({
    category: 'roof',
    name: 'Воронки водосточные',
    quantity: downspoutsCount,
    unit: 'шт',
    notes: 'Соединение желоба и трубы',
  });
  
  // Колена и отводы
  materials.push({
    category: 'roof',
    name: 'Колено водосточное',
    quantity: downspoutsCount * 2,
    unit: 'шт',
    notes: 'Отводы от стены',
  });
  
  // ===== ВЕНТИЛЯЦИЯ КРЫШИ =====
  const ventPipes = Math.ceil(roofArea / 50); // 1 труба на 50 м²
  materials.push({
    category: 'roof',
    name: 'Аэраторы кровельные',
    quantity: Math.max(2, ventPipes),
    unit: 'шт',
    notes: 'Вентиляция подкровельного пространства',
  });
  
  // Проходки для вентиляции
  materials.push({
    category: 'roof',
    name: 'Проходки кровельные',
    quantity: Math.max(2, ventPipes),
    unit: 'шт',
    notes: 'Для вентиляционных труб',
  });
  
  return materials;
}

// Площадь крыши
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
