import { NextRequest, NextResponse } from 'next/server';
import { HouseParams, MaterialItem, CalculationResult, MATERIAL_PRICES } from '@/lib/types';
import { calculateAll } from '@/lib/calculations';

// API для расчёта стоимости
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Извлекаем params из body напрямую (все поля кроме prices)
    const { prices: basePrices, ...paramsObj } = body;
    
    // Формируем объект параметров с правильными типами
    const params: HouseParams = {
      length: Number(paramsObj.length) || 10,
      width: Number(paramsObj.width) || 8,
      floorHeight: Number(paramsObj.floorHeight) || 2.7,
      floors: Number(paramsObj.floors) || 1,
      hasAttic: Boolean(paramsObj.hasAttic),
      buildingTechnology: paramsObj.buildingTechnology || 'frame',
      roofType: paramsObj.roofType || 'gable',
      roofAngle: Number(paramsObj.roofAngle) || 30,
      externalWalls: Number(paramsObj.externalWalls) || 4,
      internalWalls: Number(paramsObj.internalWalls) || 0,
      externalWallThickness: Number(paramsObj.externalWallThickness) || 200,
      internalWallThickness: Number(paramsObj.internalWallThickness) || 100,
      studSpacing: Number(paramsObj.studSpacing) || 600,
      smallWindows: Number(paramsObj.smallWindows) || 0,
      mediumWindows: Number(paramsObj.mediumWindows) || 0,
      largeWindows: Number(paramsObj.largeWindows) || 0,
      externalDoors: Number(paramsObj.externalDoors) || 1,
      internalDoors: Number(paramsObj.internalDoors) || 0,
      foundationType: paramsObj.foundationType || 'strip',
      foundationDepth: Number(paramsObj.foundationDepth) || 0.8,
      insulationType: paramsObj.insulationType || 'mineral',
      insulationThickness: Number(paramsObj.insulationThickness) || 150,
      exteriorFinish: paramsObj.exteriorFinish || 'siding',
      roofingMaterial: paramsObj.roofingMaterial || 'metal',
      // Специфичные параметры для разных технологий
      logDiameter: Number(paramsObj.logDiameter) || 220,
      brickType: paramsObj.brickType || 'solid',
      sipThickness: Number(paramsObj.sipThickness) || 174,
      gasobetonDensity: Number(paramsObj.gasobetonDensity) || 500,
    };
    
    // Базовые цены
    const prices = basePrices || MATERIAL_PRICES;
    
    // Выполняем расчёт материалов
    const result = calculateAll(params);
    
    // Добавляем цены и рассчитываем стоимость
    const materialsWithPrices = result.materials.map(item => {
      // Ищем цену по точному совпадению имени
      let unitPrice = prices[item.name] || 0;
      
      // Если не нашли, пробуем искать по категории и имени
      if (unitPrice === 0) {
        const keyByName = item.name.split(' ').slice(0, 3).join(' ');
        unitPrice = prices[keyByName] || 0;
      }
      
      // Если всё ещё не нашли, пробуем найти по ключевым словам
      if (unitPrice === 0) {
        for (const [key, price] of Object.entries(prices)) {
          if (item.name.includes(key) || key.includes(item.name.split(' ')[0])) {
            unitPrice = price;
            break;
          }
        }
      }
      
      const totalPrice = Math.round(item.quantity * unitPrice);
      
      return {
        ...item,
        unitPrice,
        totalPrice
      };
    });
    
    // Считаем общую стоимость
    const totalCost = materialsWithPrices.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    
    // Обновляем сводку
    const summaryWithCost = {
      ...result.summary,
      totalCost
    };
    
    return NextResponse.json({
      materials: materialsWithPrices,
      summary: summaryWithCost,
      basePrices
    });
    
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { error: 'Ошибка при расчёте материалов' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API для расчёта материалов каркасного дома',
    basePrices: MATERIAL_PRICES
  });
}
