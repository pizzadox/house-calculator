// Расчёт материалов для фундамента
import { HouseParams, MaterialItem, CALCULATION_CONSTANTS } from '../types';

export function calculateFoundation(params: HouseParams): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const { length, width, foundationType, foundationDepth } = params;
  
  // Периметр дома
  const perimeter = 2 * (length + width);
  // Площадь дома
  const houseArea = length * width;
  
  switch (foundationType) {
    case 'strip': {
      // Ленточный фундамент
      const foundationWidth = CALCULATION_CONSTANTS.STRIP_FOUNDATION_WIDTH;
      
      // Бетон (м³)
      const concreteVolume = perimeter * foundationWidth * foundationDepth;
      materials.push({
        category: 'foundation',
        name: 'Бетон М300',
        quantity: Math.ceil(concreteVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
        unit: 'м³',
        notes: 'С запасом 10% на потери',
      });
      
      // Арматура (м) - 4 прутка по периметру + поперечные связи
      const rebarLength = perimeter * CALCULATION_CONSTANTS.REBAR_PER_METER;
      const crossConnections = Math.ceil(perimeter / 0.3) * 0.4; // поперечные связи каждые 30 см
      const totalRebar = (rebarLength + crossConnections) * CALCULATION_CONSTANTS.WASTE_FACTOR;
      materials.push({
        category: 'foundation',
        name: 'Арматура Ø12мм',
        quantity: Math.ceil(totalRebar),
        unit: 'м',
        notes: '4 продольных прутка + поперечные связи',
      });
      
      // Опалубка (м²)
      const formworkArea = perimeter * foundationDepth * 2;
      materials.push({
        category: 'foundation',
        name: 'Доска для опалубки 25×150',
        quantity: Math.ceil(formworkArea * CALCULATION_CONSTANTS.WASTE_FACTOR),
        unit: 'м²',
        notes: 'С запасом на крепление',
      });
      
      // Гидроизоляция (м²)
      const waterproofing = perimeter * foundationWidth;
      materials.push({
        category: 'foundation',
        name: 'Гидроизоляция (рубероид/битум)',
        quantity: Math.ceil(waterproofing * CALCULATION_CONSTANTS.OVERLAP_FACTOR),
        unit: 'м²',
        notes: 'С нахлёстом 15%',
      });
      
      // Песчаная подушка
      const sandVolume = perimeter * foundationWidth * 0.15; // 15 см песка
      materials.push({
        category: 'foundation',
        name: 'Песок для подушки',
        quantity: Math.ceil(sandVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
        unit: 'м³',
        notes: 'Слой 15 см',
      });
      
      break;
    }
    
    case 'slab': {
      // Плитный фундамент
      const slabThickness = CALCULATION_CONSTANTS.SLAB_THICKNESS;
      
      // Бетон (м³)
      const concreteVolume = houseArea * slabThickness;
      materials.push({
        category: 'foundation',
        name: 'Бетон М300',
        quantity: Math.ceil(concreteVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
        unit: 'м³',
        notes: 'Плита толщиной 25 см',
      });
      
      // Арматура (м) - сетка с ячейкой 200×200 мм
      const meshSize = 0.2;
      const rebarInLength = Math.ceil(length / meshSize) + 1;
      const rebarInWidth = Math.ceil(width / meshSize) + 1;
      const rebarLength = (rebarInLength * width + rebarInWidth * length) * 2; // 2 слоя
      materials.push({
        category: 'foundation',
        name: 'Арматура Ø12мм',
        quantity: Math.ceil(rebarLength * CALCULATION_CONSTANTS.WASTE_FACTOR),
        unit: 'м',
        notes: 'Двухслойная сетка 200×200 мм',
      });
      
      // Гидроизоляция (м²)
      materials.push({
        category: 'foundation',
        name: 'Гидроизоляция (мембрана)',
        quantity: Math.ceil(houseArea * CALCULATION_CONSTANTS.OVERLAP_FACTOR),
        unit: 'м²',
        notes: 'Под плиту целиком',
      });
      
      // Песчаная подушка
      const sandVolume = houseArea * 0.2; // 20 см песка
      materials.push({
        category: 'foundation',
        name: 'Песок для подушки',
        quantity: Math.ceil(sandVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
        unit: 'м³',
        notes: 'Слой 20 см',
      });
      
      // Щебень
      const gravelVolume = houseArea * 0.1; // 10 см щебня
      materials.push({
        category: 'foundation',
        name: 'Щебень фракции 20-40',
        quantity: Math.ceil(gravelVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
        unit: 'м³',
        notes: 'Слой 10 см под песок',
      });
      
      break;
    }
    
    case 'pile': {
      // Свайный фундамент
      const pileDiameter = CALCULATION_CONSTANTS.PILE_DIAMETER;
      const pileSpacing = CALCULATION_CONSTANTS.PILE_SPACING;
      
      // Количество свай по периметру
      const pilesOnPerimeter = Math.ceil(perimeter / pileSpacing);
      // Количество свай внутри (сетка)
      const pilesInsideLength = Math.max(0, Math.floor(length / pileSpacing) - 1);
      const pilesInsideWidth = Math.max(0, Math.floor(width / pileSpacing) - 1);
      const pilesInside = pilesInsideLength * pilesInsideWidth;
      const totalPiles = pilesOnPerimeter + pilesInside;
      
      // Бетон для свай (м³)
      const pileVolume = Math.PI * Math.pow(pileDiameter / 2, 2) * foundationDepth * totalPiles;
      materials.push({
        category: 'foundation',
        name: 'Бетон М300 для свай',
        quantity: Math.ceil(pileVolume * CALCULATION_CONSTANTS.WASTE_FACTOR),
        unit: 'м³',
        notes: `${totalPiles} свай Ø${pileDiameter * 1000}мм`,
      });
      
      // Арматура для свай
      const rebarPerPile = 4 * foundationDepth; // 4 прутка в свае
      const totalRebar = rebarPerPile * totalPiles;
      materials.push({
        category: 'foundation',
        name: 'Арматура Ø12мм для свай',
        quantity: Math.ceil(totalRebar * CALCULATION_CONSTANTS.WASTE_FACTOR),
        unit: 'м',
        notes: 'По 4 прутка в каждой свае',
      });
      
      // Ростверк (балка по сваям)
      const beamHeight = 0.4;
      const beamWidth = 0.3;
      const beamConcrete = perimeter * beamHeight * beamWidth;
      materials.push({
        category: 'foundation',
        name: 'Бетон М300 для ростверка',
        quantity: Math.ceil(beamConcrete * CALCULATION_CONSTANTS.WASTE_FACTOR),
        unit: 'м³',
        notes: 'Ростверк 300×400 мм',
      });
      
      // Арматура для ростверка
      const rebarRoof = perimeter * CALCULATION_CONSTANTS.REBAR_PER_METER;
      materials.push({
        category: 'foundation',
        name: 'Арматура Ø12мм для ростверка',
        quantity: Math.ceil(rebarRoof * CALCULATION_CONSTANTS.WASTE_FACTOR),
        unit: 'м',
        notes: '4 прутка по периметру',
      });
      
      // Оголовки свай
      materials.push({
        category: 'foundation',
        name: 'Оголовки свай',
        quantity: totalPiles,
        unit: 'шт',
        notes: 'Для крепления ростверка',
      });
      
      break;
    }
  }
  
  // Анкеры для крепления каркаса к фундаменту
  const anchorsCount = Math.ceil(perimeter / 1.5); // каждые 1.5 м
  materials.push({
    category: 'foundation',
    name: 'Анкеры фундаментные',
    quantity: anchorsCount,
    unit: 'шт',
    notes: 'Для крепления обвязки',
  });
  
  return materials;
}
