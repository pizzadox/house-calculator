// Расчёт материалов для SIP-панельных домов
import { HouseParams, MaterialItem, CALCULATION_CONSTANTS } from '../../types';

export function calculateSIP(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const { length, width, floorHeight, floors, hasAttic } = params;
  
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
  
  // Толщина SIP панели
  const sipThickness = params.sipThickness || 174; // мм
  
  // ===== СТЕНЫ ИЗ SIP ПАНЕЛЕЙ =====
  
  // SIP панели для внешних стен
  const sipAreaWalls = wallArea * CALCULATION_CONSTANTS.WASTE_FACTOR;
  
  if (sipThickness >= 220) {
    materials.push({
      category: 'sip',
      name: 'SIP панель 2500×1250×224мм',
      quantity: Math.ceil(sipAreaWalls / CALCULATION_CONSTANTS.SIP_PANEL_AREA),
      unit: 'шт',
      notes: `Площадь стен: ${Math.ceil(sipAreaWalls)} м²`,
    });
  } else {
    materials.push({
      category: 'sip',
      name: 'SIP панель 2500×1250×174мм',
      quantity: Math.ceil(sipAreaWalls / CALCULATION_CONSTANTS.SIP_PANEL_AREA),
      unit: 'шт',
      notes: `Площадь стен: ${Math.ceil(sipAreaWalls)} м²`,
    });
  }
  
  // Обвязочный брус
  const bindingLength = perimeter * 2 * floors;
  materials.push({
    category: 'sip',
    name: 'Брус сухой для SIP обвязки 50×150',
    quantity: Math.ceil(bindingLength),
    unit: 'п.м.',
    notes: 'Верхняя и нижняя обвязка',
  });
  
  // ===== ПЕРЕКРЫТИЯ =====
  
  // SIP панели для перекрытий (пол + потолок)
  const floorSipArea = houseArea * floors * 2 * CALCULATION_CONSTANTS.WASTE_FACTOR;
  
  materials.push({
    category: 'sip',
    name: 'SIP панель 2500×625×174мм',
    quantity: Math.ceil(floorSipArea / (2.5 * 0.625)),
    unit: 'шт',
    notes: 'Перекрытия и полы',
  });
  
  // Брус для лаг перекрытия
  const lagCount = Math.ceil(length / 0.5);
  const lagLength = width * lagCount * floors;
  
  materials.push({
    category: 'sip',
    name: 'Брус сухой для SIP обвязки 50×200',
    quantity: Math.ceil(lagLength),
    unit: 'п.м.',
    notes: 'Лаги перекрытия',
  });
  
  // ===== КРЫША =====
  
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
  
  const roofSipArea = roofArea * CALCULATION_CONSTANTS.WASTE_FACTOR;
  
  materials.push({
    category: 'sip',
    name: 'SIP панель 2500×1250×174мм',
    quantity: Math.ceil(roofSipArea / CALCULATION_CONSTANTS.SIP_PANEL_AREA),
    unit: 'шт',
    notes: 'Стропильная система и кровля',
  });
  
  // ===== КРЕПЁЖ =====
  
  const glueTubes = Math.ceil((sipAreaWalls + floorSipArea + roofSipArea) / 30);
  materials.push({
    category: 'fasteners',
    name: 'Пенополиуретановый клей для SIP',
    quantity: glueTubes,
    unit: 'баллон',
    notes: 'Для склеивания панелей',
  });
  
  const screwsCount = Math.ceil((sipAreaWalls + floorSipArea + roofSipArea) * 8);
  materials.push({
    category: 'fasteners',
    name: 'Саморезы для SIP панелей',
    quantity: screwsCount,
    unit: 'шт',
    notes: 'Для крепления панелей',
  });
  
  const seamLength = perimeter * floorHeight * floors / 0.625 * 2;
  materials.push({
    category: 'sip',
    name: 'Лента самоклеящаяся для швов SIP',
    quantity: Math.ceil(seamLength),
    unit: 'п.м.',
    notes: 'Герметизация швов',
  });
  
  // ===== ВНУТРЕННЯЯ ОТДЕЛКА =====
  
  const gklArea = wallArea * 2 + houseArea * floors * 2;
  const gklSheets = Math.ceil(gklArea / 3 * 1.05);
  
  materials.push({
    category: 'finish',
    name: 'Сухая штукатурка (гипсокартон) 12.5мм',
    quantity: gklSheets,
    unit: 'лист',
    notes: 'Внутренняя обшивка',
  });
  
  materials.push({
    category: 'finish',
    name: 'Шпаклёвка для швов SIP',
    quantity: Math.ceil(gklSheets / 8),
    unit: 'мешок',
    notes: 'Заделка стыков',
  });
  
  return materials;
}
