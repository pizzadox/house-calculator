'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, Home as HomeIcon, Layers, Building2, DoorOpen, Square, Hammer,
  TreePine, Thermometer, Ruler, ChevronDown, Eye, Loader2, AlertCircle, X,
  FileSpreadsheet, FileText, Check, Circle, Info
} from 'lucide-react';
import { CATEGORY_NAMES, MaterialItem, CalculationResult, MATERIAL_PRICES, TECHNOLOGY_NAMES, TECHNOLOGY_DESCRIPTIONS, BuildingTechnology } from '@/lib/types';

interface HouseFormParams {
  buildingTechnology: BuildingTechnology;
  length: string;
  width: string;
  floorHeight: string;
  floors: string;
  hasAttic: boolean;
  roofType: string;
  roofAngle: string;
  externalWalls: string;
  internalWalls: string;
  externalWallThickness: string;
  internalWallThickness: string;
  studSpacing: string;
  smallWindows: string;
  mediumWindows: string;
  largeWindows: string;
  externalDoors: string;
  internalDoors: string;
  foundationType: string;
  foundationDepth: string;
  insulationType: string;
  insulationThickness: string;
  exteriorFinish: string;
  roofingMaterial: string;
  logDiameter: string;
  brickType: string;
  sipThickness: string;
  gasobetonDensity: string;
}

const defaultParams: HouseFormParams = {
  buildingTechnology: 'frame',
  length: '10', width: '8', floorHeight: '2.7', floors: '1', hasAttic: false,
  roofType: 'gable', roofAngle: '30', externalWalls: '4', internalWalls: '0',
  externalWallThickness: '200', internalWallThickness: '100', studSpacing: '600',
  smallWindows: '2', mediumWindows: '2', largeWindows: '0',
  externalDoors: '1', internalDoors: '3', foundationType: 'strip', foundationDepth: '0.8',
  insulationType: 'mineral', insulationThickness: '150', exteriorFinish: 'siding', roofingMaterial: 'metal',
  logDiameter: '220', brickType: 'solid', sipThickness: '174', gasobetonDensity: '500',
};

const catColors: Record<string, string> = {
  foundation: 'from-amber-400 to-orange-500',
  frame: 'from-emerald-400 to-green-500',
  sheathing: 'from-blue-400 to-indigo-500',
  insulation: 'from-cyan-400 to-teal-500',
  fasteners: 'from-slate-400 to-gray-500',
  roof: 'from-purple-400 to-violet-500',
  finish: 'from-pink-400 to-rose-500',
  windows: 'from-indigo-400 to-blue-500',
  // Новые технологии
  sip: 'from-orange-400 to-amber-500',
  gasobeton: 'from-sky-400 to-blue-500',
  concrete_slab: 'from-gray-400 to-slate-500',
  log: 'from-yellow-600 to-amber-600',
  brick: 'from-red-400 to-orange-500',
  masonry: 'from-stone-400 to-stone-500',
};

const catIcons: Record<string, React.ElementType> = {
  foundation: Square, frame: TreePine, sheathing: Layers, insulation: Thermometer,
  fasteners: Hammer, roof: Layers, finish: Building2, windows: DoorOpen,
  sip: Layers, gasobeton: Building2, concrete_slab: Square, log: TreePine, brick: Building2, masonry: Hammer,
};

const selectOptions: Record<string, {value: string, label: string}[]> = {
  // Технологии строительства
  buildingTechnology: [
    {value: 'frame', label: '🪵 Каркасный дом'}, 
    {value: 'sip', label: '📦 SIP панели'}, 
    {value: 'gasobeton', label: '🧱 Газобетон'}, 
    {value: 'concrete_slab', label: '🏗️ Ж/Б плиты'}, 
    {value: 'log', label: '🪵 Бревенчатый сруб'}, 
    {value: 'brick', label: '🧱 Кирпичный дом'}
  ],
  // Основные параметры
  floorHeight: [{value: '2.5', label: '2.5 м'}, {value: '2.7', label: '2.7 м'}, {value: '3.0', label: '3.0 м'}],
  floors: [{value: '1', label: '1 этаж'}, {value: '2', label: '2 этажа'}],
  roofType: [{value: 'gable', label: 'Двускатная'}, {value: 'shed', label: 'Односкатная'}, {value: 'hip', label: 'Вальмовая'}],
  roofingMaterial: [{value: 'metal', label: 'Металлочерепица'}, {value: 'shingle', label: 'Мягкая кровля'}, {value: 'profile', label: 'Профнастил'}],
  externalWalls: [{value: '4', label: '4 стены'}, {value: '5', label: '5 стен'}, {value: '6', label: '6 стен'}],
  // Толщина стен зависит от технологии
  externalWallThickness: [
    {value: '150', label: '150 мм'}, 
    {value: '200', label: '200 мм'}, 
    {value: '250', label: '250 мм'},
    {value: '300', label: '300 мм'},
    {value: '375', label: '375 мм'},
    {value: '400', label: '400 мм'},
    {value: '510', label: '510 мм (2 кирп.)'},
  ],
  studSpacing: [{value: '600', label: '600 мм'}, {value: '400', label: '400 мм'}],
  foundationType: [{value: 'strip', label: 'Ленточный'}, {value: 'pile', label: 'Свайный'}, {value: 'slab', label: 'Плитный'}],
  insulationType: [{value: 'mineral', label: 'Минвата'}, {value: 'eco', label: 'Эковата'}, {value: 'foam', label: 'Пенопласт'}],
  insulationThickness: [{value: '100', label: '100 мм'}, {value: '150', label: '150 мм'}, {value: '200', label: '200 мм'}],
  // Специфичные параметры для разных технологий
  logDiameter: [
    {value: '180', label: 'Ø180 мм'}, 
    {value: '200', label: 'Ø200 мм'}, 
    {value: '220', label: 'Ø220 мм'}, 
    {value: '240', label: 'Ø240 мм'},
    {value: '260', label: 'Ø260 мм'},
    {value: '280', label: 'Ø280 мм'}
  ],
  brickType: [
    {value: 'solid', label: 'Полнотелый'}, 
    {value: 'hollow', label: 'Пустотелый'}, 
    {value: 'facing', label: 'Облицовочный + рядовой'}
  ],
  sipThickness: [
    {value: '124', label: '124 мм'}, 
    {value: '174', label: '174 мм'}, 
    {value: '224', label: '224 мм'}
  ],
  gasobetonDensity: [
    {value: '400', label: 'D400 (теплоизоляционный)'}, 
    {value: '500', label: 'D500 (конструкционный)'}, 
    {value: '600', label: 'D600 (прочный)'}
  ],
};

const houseElementLabels: Record<string, (p: HouseFormParams) => string> = {
  roof: (p) => `Крыша: ${p.roofType === 'gable' ? 'Двускатная' : p.roofType === 'shed' ? 'Односкатная' : 'Вальмовая'}, угол ${p.roofAngle}°`,
  walls: (p) => `Стены: ${p.externalWalls} внешних, толщина ${p.externalWallThickness}мм`,
  windows: (p) => `Окна: ${p.smallWindows} малых, ${p.mediumWindows} средних, ${p.largeWindows} больших`,
  door: (p) => `Двери: ${p.externalDoors} входных, ${p.internalDoors} межкомнатных`,
  foundation: (p) => `Фундамент: ${p.foundationType === 'strip' ? 'Ленточный' : p.foundationType === 'pile' ? 'Свайный' : 'Плитный'}`,
  insulation: (p) => `Утепление: ${p.insulationType === 'mineral' ? 'Минвата' : p.insulationType === 'eco' ? 'Эковата' : 'Пенопласт'}`,
  attic: (p) => `Мансарда: ${p.hasAttic ? 'Да' : 'Нет'}`,
  dimensions: (p) => `Размеры: ${p.length}×${p.width}м, ${p.floors} этаж(а)`,
};

export default function Home() {
  const [params, setParams] = useState<HouseFormParams>(defaultParams);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [openSection, setOpenSection] = useState<string | null>('Размеры'); // Только одна открытая секция
  const [prices, setPrices] = useState(MATERIAL_PRICES);
  const [showProgress, setShowProgress] = useState(false);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const progressInfo = useMemo(() => {
    const fields = [
      { key: 'length', label: 'Длина', value: params.length },
      { key: 'width', label: 'Ширина', value: params.width },
      { key: 'floorHeight', label: 'Высота этажа', value: params.floorHeight },
      { key: 'floors', label: 'Этажность', value: params.floors },
      { key: 'roofType', label: 'Тип крыши', value: params.roofType },
      { key: 'externalWalls', label: 'Внешние стены', value: params.externalWalls },
      { key: 'smallWindows', label: 'Малые окна', value: params.smallWindows },
      { key: 'externalDoors', label: 'Входные двери', value: params.externalDoors },
      { key: 'foundationType', label: 'Тип фундамента', value: params.foundationType },
    ];
    const filled = fields.filter(f => f.value && f.value !== '0');
    return { fields, filled, percent: Math.round((filled.length / fields.length) * 100) };
  }, [params]);

  const update = useCallback((k: keyof HouseFormParams, v: string | boolean) => {
    setParams(p => ({ ...p, [k]: v }));
  }, []);

  const toggleExpand = useCallback((cat: string) => {
    setExpanded(e => e.has(cat) ? new Set([...e].filter(c => c !== cat)) : new Set([...e, cat]));
  }, []);

  const calcTotal = useMemo(() => {
    if (!result) return 0;
    return result.materials.reduce((s, m) => s + (m.totalPrice || 0), 0);
  }, [result]);

  const grouped = useMemo(() => {
    if (!result) return null;
    return result.materials.reduce((a, m) => {
      (a[m.category] = a[m.category] || []).push(m);
      return a;
    }, {} as Record<string, MaterialItem[]>);
  }, [result]);

  const calculate = async () => {
    setLoading(true);
    setError(null);
    setOpenSection(null); // Закрыть открытую секцию формы
    setExpanded(new Set()); // Свернуть все секции результатов
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, prices }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка расчёта');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    if (!result) return;
    try {
      const XLSX = await import('xlsx').then(m => m.default || m);
      const wb = XLSX.utils.book_new();
      
      // Лист: Характеристики
      const infoData = [
        ['ХАРАКТЕРИСТИКИ ДОМА', '', ''],
        ['', '', ''],
        ['Параметр', 'Значение', 'Ед. изм.'],
        ['Длина', params.length, 'м'],
        ['Ширина', params.width, 'м'],
        ['Площадь', Number(params.length) * Number(params.width), 'м²'],
        ['Высота этажа', params.floorHeight, 'м'],
        ['Этажей', params.floors, ''],
        ['Мансарда', params.hasAttic ? 'Да' : 'Нет', ''],
        ['Тип крыши', params.roofType === 'gable' ? 'Двускатная' : params.roofType === 'hip' ? 'Вальмовая' : 'Односкатная', ''],
        ['Угол наклона крыши', params.roofAngle, '°'],
        ['Материал кровли', params.roofingMaterial === 'metal' ? 'Металлочерепица' : params.roofingMaterial === 'shingle' ? 'Мягкая кровля' : 'Профнастил', ''],
        ['Внешних стен', params.externalWalls, 'шт'],
        ['Внутренних стен', params.internalWalls, 'м'],
        ['Толщина внешних стен', params.externalWallThickness, 'мм'],
        ['Фундамент', params.foundationType === 'strip' ? 'Ленточный' : params.foundationType === 'pile' ? 'Свайный' : 'Плитный', ''],
        ['Глубина фундамента', params.foundationDepth, 'м'],
        ['Утеплитель', params.insulationType === 'mineral' ? 'Минвата' : params.insulationType === 'eco' ? 'Эковата' : 'Пенопласт', ''],
        ['Толщина утеплителя', params.insulationThickness, 'мм'],
        ['Малых окон', params.smallWindows, 'шт'],
        ['Средних окон', params.mediumWindows, 'шт'],
        ['Больших окон', params.largeWindows, 'шт'],
        ['Входных дверей', params.externalDoors, 'шт'],
        ['Межкомнатных дверей', params.internalDoors, 'шт'],
        ['', '', ''],
        ['ИТОГО СТОИМОСТЬ МАТЕРИАЛОВ:', calcTotal, '₽'],
      ];
      const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
      wsInfo['!cols'] = [{ wch: 28 }, { wch: 20 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsInfo, 'Характеристики');
      
      // Лист: Материалы с формулами
      const matData: (string | number | { f: string })[][] = [
        ['№', 'Категория', 'Наименование', 'Количество', 'Цена, ₽', 'Сумма, ₽', 'Ед.', 'Примечание'],
      ];
      let rowIdx = 2;
      Object.entries(grouped || {}).forEach(([cat, items]) => {
        items.forEach((m, i) => {
          matData.push([
            i + 1,
            CATEGORY_NAMES[cat],
            m.name,
            m.quantity,
            m.unitPrice || 0,
            { f: `D${rowIdx}*E${rowIdx}` },
            m.unit,
            m.notes || '',
          ]);
          rowIdx++;
        });
      });
      matData.push(['', '', '', '', 'ИТОГО:', { f: `SUM(F2:F${rowIdx - 1})` }, '', '']);
      
      const wsMat = XLSX.utils.aoa_to_sheet(matData);
      wsMat['!cols'] = [
        { wch: 4 }, { wch: 14 }, { wch: 32 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 8 }, { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(wb, wsMat, 'Материалы');
      
      const buf = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
      const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `расчет_${params.length}x${params.width}м.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Excel error:', e);
      setError('Ошибка экспорта в Excel');
    }
  };

  const exportPDF = async () => {
    if (!result) return;
    try {
      // Захват SVG превью дома
      let houseImageBase64: string | null = null;
      if (svgRef.current) {
        try {
          const svgElement = svgRef.current;
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          
          const img = new Image();
          img.src = svgUrl;
          await new Promise<void>((resolve) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width * 2;
              canvas.height = img.height * 2;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = '#e0f2fe';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                houseImageBase64 = canvas.toDataURL('image/png');
              }
              URL.revokeObjectURL(svgUrl);
              resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(svgUrl);
              resolve();
            };
          });
        } catch { /* skip */ }
      }

      // Создаём HTML контент для PDF
      const pdfContent = document.createElement('div');
      pdfContent.style.cssText = 'font-family: Montserrat, Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background: white;';
      
      // Заголовок
      pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1e40af; font-size: 24px; margin: 0 0 5px 0;">Расчёт материалов</h1>
          <h2 style="color: #1e40af; font-size: 18px; margin: 0; font-weight: 500;">каркасного дома</h2>
        </div>
        
        ${houseImageBase64 ? `<div style="text-align: center; margin: 20px 0;"><img src="${houseImageBase64}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" /></div>` : ''}
        
        <div style="background: #f0f8ff; border: 2px solid #1e40af; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 14px;">ПАРАМЕТРЫ ДОМА</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: #333;">
            <div>📐 Размеры: <strong>${params.length} × ${params.width} м</strong></div>
            <div>🏢 Этажность: <strong>${params.floors} этаж(а)</strong></div>
            <div>📏 Высота этажа: <strong>${params.floorHeight} м</strong></div>
            <div>🏠 Крыша: <strong>${params.roofType === 'gable' ? 'Двускатная' : params.roofType === 'hip' ? 'Вальмовая' : 'Односкатная'}, угол ${params.roofAngle}°</strong></div>
            <div>🏗️ Фундамент: <strong>${params.foundationType === 'strip' ? 'Ленточный' : params.foundationType === 'pile' ? 'Свайный' : 'Плитный'}</strong></div>
            <div>🧊 Утепление: <strong>${params.insulationType === 'mineral' ? 'Минвата' : params.insulationType === 'eco' ? 'Эковата' : 'Пенопласт'}</strong></div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; color: #dc2626;">${calcTotal.toLocaleString('ru-RU')} ₽</div>
          <div style="font-size: 12px; color: #6b7280;">ориентировочная стоимость материалов</div>
        </div>
        
        <div style="page-break-before: always;"></div>
        
        <h2 style="color: #1e40af; font-size: 16px; border-bottom: 2px solid #1e40af; padding-bottom: 5px;">Ведомость материалов</h2>
      `;
      
      // Добавляем категории материалов
      const categoriesHtml = Object.entries(grouped || {}).map(([cat, items]) => {
        const catName = cat === 'foundation' ? 'Фундамент' : cat === 'frame' ? 'Каркас' : 
          cat === 'sheathing' ? 'Обшивка' : cat === 'insulation' ? 'Утепление' : 
          cat === 'fasteners' ? 'Крепёж' : cat === 'roof' ? 'Кровля' : 
          cat === 'finish' ? 'Отделка' : 'Окна и двери';
        const catSum = items.reduce((s, m) => s + (m.totalPrice || 0), 0);
        
        const itemsHtml = items.map(m => `
          <tr>
            <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb;">${m.name}</td>
            <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${m.quantity.toLocaleString('ru-RU')} ${m.unit}</td>
            <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${m.unitPrice?.toLocaleString('ru-RU') || 0} ₽</td>
            <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500; color: #1e40af;">${m.totalPrice?.toLocaleString('ru-RU') || 0} ₽</td>
          </tr>
        `).join('');
        
        return `
          <div style="margin: 15px 0;">
            <div style="background: linear-gradient(to right, #1e40af, #3b82f6); color: white; padding: 8px 12px; border-radius: 4px 4px 0 0; display: flex; justify-content: space-between;">
              <span style="font-weight: 500;">${catName}</span>
              <span style="font-weight: bold;">${catSum.toLocaleString('ru-RU')} ₽</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; background: white;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #e2e8f0;">Наименование</th>
                  <th style="padding: 6px 8px; text-align: center; border-bottom: 2px solid #e2e8f0;">Количество</th>
                  <th style="padding: 6px 8px; text-align: right; border-bottom: 2px solid #e2e8f0;">Цена</th>
                  <th style="padding: 6px 8px; text-align: right; border-bottom: 2px solid #e2e8f0;">Сумма</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
        `;
      }).join('');
      
      pdfContent.innerHTML += categoriesHtml;
      
      // Итого
      pdfContent.innerHTML += `
        <div style="margin-top: 20px; border-top: 3px solid #1e40af; padding-top: 15px; display: flex; justify-content: space-between; font-size: 16px;">
          <span style="color: #1e40af; font-weight: bold;">ИТОГО:</span>
          <span style="color: #dc2626; font-weight: bold; font-size: 20px;">${calcTotal.toLocaleString('ru-RU')} ₽</span>
        </div>
        
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #6b7280; text-align: center;">
          <p>Расчёт выполнен в соответствии со СП 31-105-2002 "Проектирование и строительство энергоэффективных одноквартирных жилых домов с деревянным каркасом"</p>
          <p>Цены актуальны для региона: Великий Новгород (${new Date().toLocaleDateString('ru-RU')})</p>
        </div>
      `;
      
      // Скрываем контейнер
      pdfContent.style.position = 'absolute';
      pdfContent.style.left = '-9999px';
      document.body.appendChild(pdfContent);
      
      // Импортируем html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `расчет_${params.length}x${params.width}м.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true 
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };
      
      await html2pdf().set(opt).from(pdfContent).save();
      
      // Удаляем временный контейнер
      document.body.removeChild(pdfContent);
      
    } catch (e) {
      console.error('PDF error:', e);
      setError('Ошибка экспорта в PDF');
    }
  };

  const updatePrice = (name: string, price: number) => {
    setPrices(p => ({ ...p, [name.toLowerCase()]: price }));
    if (result) {
      setResult(r => r ? {
        ...r,
        materials: r.materials.map(m => 
          m.name.toLowerCase() === name.toLowerCase()
            ? { ...m, unitPrice: price, totalPrice: Math.round(m.quantity * price) }
            : m
        )
      } : r);
    }
  };

  const handleHouseElementClick = (element: string, e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setActiveElement(activeElement === element ? null : element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-lg sticky top-0 z-20">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg"><HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" /></div>
            <div>
              <h1 className="text-sm sm:text-base font-bold">Калькулятор материалов</h1>
              <p className="text-[9px] sm:text-[10px] text-white/80 hidden sm:block">Frame House • СП 31-105-2002</p>
            </div>
          </div>
          <button 
            onClick={() => setShowProgress(!showProgress)}
            className="flex items-center gap-1 sm:gap-2 bg-white/10 rounded-lg px-2 py-1 hover:bg-white/20 transition"
          >
            <div className="text-right">
              <div className="text-[9px] sm:text-[10px] text-white/70">Заполнено</div>
              <div className="text-xs sm:text-sm font-bold">{progressInfo.percent}%</div>
            </div>
            <div className="w-8 sm:w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressInfo.percent}%` }} />
            </div>
          </button>
        </div>
        
        {showProgress && (
          <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-2">
            <div className="bg-white/10 rounded-lg p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[9px] sm:text-[10px]">
                {progressInfo.fields.map(f => (
                  <div key={f.key} className="flex items-center gap-1">
                    {f.value && f.value !== '0' ? (
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-300" />
                    ) : (
                      <Circle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/40" />
                    )}
                    <span className={f.value && f.value !== '0' ? 'text-white' : 'text-white/50'}>
                      {f.label}: {f.value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
        {/* House Preview */}
        <InteractiveHousePreview 
          params={params} 
          activeElement={activeElement}
          onElementClick={handleHouseElementClick}
          tooltipPos={tooltipPos}
          svgRef={svgRef}
        />

        {/* Form Sections - Accordion Style */}
        <div className="space-y-2 sm:space-y-3">
          {/* Технология строительства - всегда открыта */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-2.5 text-white">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Технология строительства</span>
              </div>
            </div>
            <div className="p-3">
              <Select value={params.buildingTechnology} onValueChange={v => update('buildingTechnology', v)}>
                <SelectTrigger className="h-10 text-sm bg-white border-violet-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.buildingTechnology.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-500 mt-2">
                {TECHNOLOGY_DESCRIPTIONS[params.buildingTechnology]}
              </p>
              
              {/* Специфичные параметры для выбранной технологии */}
              {params.buildingTechnology === 'log' && (
                <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                  <Label className="text-[10px] text-amber-700">Диаметр бревна</Label>
                  <Select value={params.logDiameter} onValueChange={v => update('logDiameter', v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {selectOptions.logDiameter.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {params.buildingTechnology === 'brick' && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg">
                  <Label className="text-[10px] text-red-700">Тип кирпича</Label>
                  <Select value={params.brickType} onValueChange={v => update('brickType', v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {selectOptions.brickType.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {params.buildingTechnology === 'sip' && (
                <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                  <Label className="text-[10px] text-orange-700">Толщина SIP панели</Label>
                  <Select value={params.sipThickness} onValueChange={v => update('sipThickness', v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {selectOptions.sipThickness.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {params.buildingTechnology === 'gasobeton' && (
                <div className="mt-3 p-2 bg-sky-50 rounded-lg">
                  <Label className="text-[10px] text-sky-700">Плотность газобетона</Label>
                  <Select value={params.gasobetonDensity} onValueChange={v => update('gasobetonDensity', v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {selectOptions.gasobetonDensity.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>
          
          {/* Открытая секция на всю ширину */}
          {openSection === 'Размеры' && (
            <FormSectionExpanded title="Размеры" icon={Ruler} color="from-orange-400 to-amber-500" onClose={() => setOpenSection(null)}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Field label="Длина (м)" value={params.length} onChange={v => update('length', v)} />
                <Field label="Ширина (м)" value={params.width} onChange={v => update('width', v)} />
                <Field label="Высота эт." value={params.floorHeight} onChange={v => update('floorHeight', v)} options={selectOptions.floorHeight} />
                <Field label="Этажность" value={params.floors} onChange={v => update('floors', v)} options={selectOptions.floors} />
                <div className="col-span-2 sm:col-span-4 flex items-center justify-between bg-amber-50 rounded-lg p-2 text-xs">
                  <span className="text-amber-800">Мансарда</span>
                  <Switch checked={params.hasAttic} onCheckedChange={v => update('hasAttic', v)} />
                </div>
              </div>
            </FormSectionExpanded>
          )}
          
          {openSection === 'Крыша' && (
            <FormSectionExpanded title="Крыша" icon={Layers} color="from-blue-400 to-indigo-500" onClose={() => setOpenSection(null)}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Field label="Тип" value={params.roofType} onChange={v => update('roofType', v)} options={selectOptions.roofType} />
                <Field label="Угол °" value={params.roofAngle} onChange={v => update('roofAngle', v)} />
                <Field label="Покрытие" value={params.roofingMaterial} onChange={v => update('roofingMaterial', v)} options={selectOptions.roofingMaterial} />
              </div>
            </FormSectionExpanded>
          )}
          
          {openSection === 'Стены' && (
            <FormSectionExpanded title="Стены" icon={Building2} color="from-emerald-400 to-green-500" onClose={() => setOpenSection(null)}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Field label="Внеш. стен" value={params.externalWalls} onChange={v => update('externalWalls', v)} options={selectOptions.externalWalls} />
                <Field label="Внутр. (м)" value={params.internalWalls} onChange={v => update('internalWalls', v)} />
                <Field label="Толщина" value={params.externalWallThickness} onChange={v => update('externalWallThickness', v)} options={selectOptions.externalWallThickness} />
                <Field label="Шаг мм" value={params.studSpacing} onChange={v => update('studSpacing', v)} options={selectOptions.studSpacing} />
              </div>
            </FormSectionExpanded>
          )}
          
          {openSection === 'Проёмы' && (
            <FormSectionExpanded title="Проёмы" icon={DoorOpen} color="from-indigo-400 to-blue-500" onClose={() => setOpenSection(null)}>
              <div className="space-y-2">
                <div className="text-[10px] text-slate-500">Окна:</div>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Малые" value={params.smallWindows} onChange={v => update('smallWindows', v)} />
                  <Field label="Средние" value={params.mediumWindows} onChange={v => update('mediumWindows', v)} />
                  <Field label="Большие" value={params.largeWindows} onChange={v => update('largeWindows', v)} />
                </div>
                <div className="text-[10px] text-slate-500">Двери:</div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Входные" value={params.externalDoors} onChange={v => update('externalDoors', v)} />
                  <Field label="Межкомнатные" value={params.internalDoors} onChange={v => update('internalDoors', v)} />
                </div>
              </div>
            </FormSectionExpanded>
          )}
          
          {openSection === 'Фундамент' && (
            <FormSectionExpanded title="Фундамент" icon={Square} color="from-amber-500 to-orange-600" onClose={() => setOpenSection(null)}>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Тип" value={params.foundationType} onChange={v => update('foundationType', v)} options={selectOptions.foundationType} />
                <Field label="Глубина (м)" value={params.foundationDepth} onChange={v => update('foundationDepth', v)} />
              </div>
            </FormSectionExpanded>
          )}
          
          {openSection === 'Утепление' && (
            <FormSectionExpanded title="Утепление" icon={Thermometer} color="from-cyan-400 to-teal-500" onClose={() => setOpenSection(null)}>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Тип" value={params.insulationType} onChange={v => update('insulationType', v)} options={selectOptions.insulationType} />
                <Field label="Толщина" value={params.insulationThickness} onChange={v => update('insulationThickness', v)} options={selectOptions.insulationThickness} />
              </div>
            </FormSectionExpanded>
          )}
          
          {/* Сетка закрытых секций */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {['Размеры', 'Крыша', 'Стены', 'Проёмы', 'Фундамент', 'Утепление'].map(section => (
              openSection !== section && (
                <FormSectionButton
                  key={section}
                  title={section}
                  icon={section === 'Размеры' ? Ruler : section === 'Крыша' ? Layers : section === 'Стены' ? Building2 : section === 'Проёмы' ? DoorOpen : section === 'Фундамент' ? Square : Thermometer}
                  color={section === 'Размеры' ? 'from-orange-400 to-amber-500' : section === 'Крыша' ? 'from-blue-400 to-indigo-500' : section === 'Стены' ? 'from-emerald-400 to-green-500' : section === 'Проёмы' ? 'from-indigo-400 to-blue-500' : section === 'Фундамент' ? 'from-amber-500 to-orange-600' : 'from-cyan-400 to-teal-500'}
                  onClick={() => setOpenSection(section)}
                />
              )
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-300">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 text-white text-center">
                <div className="text-xl sm:text-2xl font-bold">{calcTotal.toLocaleString('ru-RU')} ₽</div>
                <div className="text-[10px] sm:text-xs text-white/80">ориентировочная стоимость</div>
              </div>
              <CardContent className="p-2">
                <div className="grid grid-cols-5 gap-1 text-center text-[9px] sm:text-[10px]">
                  <div className="p-1 sm:p-1.5 bg-amber-50 rounded">
                    <TreePine className="w-3 h-3 mx-auto text-amber-600" />
                    <div className="font-bold mt-0.5">{result.summary.totalLumberVolume}</div>
                    <div className="text-slate-400">м³</div>
                  </div>
                  <div className="p-1 sm:p-1.5 bg-green-50 rounded">
                    <Thermometer className="w-3 h-3 mx-auto text-green-600" />
                    <div className="font-bold mt-0.5">{result.summary.totalInsulationVolume}</div>
                    <div className="text-slate-400">м³</div>
                  </div>
                  <div className="p-1 sm:p-1.5 bg-blue-50 rounded">
                    <Layers className="w-3 h-3 mx-auto text-blue-600" />
                    <div className="font-bold mt-0.5">{result.summary.totalRoofArea}</div>
                    <div className="text-slate-400">м²</div>
                  </div>
                  <div className="p-1 sm:p-1.5 bg-purple-50 rounded">
                    <Building2 className="w-3 h-3 mx-auto text-purple-600" />
                    <div className="font-bold mt-0.5">{result.summary.totalWallArea}</div>
                    <div className="text-slate-400">м²</div>
                  </div>
                  <div className="p-1 sm:p-1.5 bg-pink-50 rounded">
                    <Ruler className="w-3 h-3 mx-auto text-pink-600" />
                    <div className="font-bold mt-0.5">{result.summary.totalFloorArea}</div>
                    <div className="text-slate-400">м²</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {Object.entries(grouped || {}).map(([cat, items]) => (
                <Card key={cat} className="border-0 shadow overflow-hidden">
                  <button 
                    onClick={() => toggleExpand(cat)} 
                    className={`w-full p-2 text-white flex justify-between items-center bg-gradient-to-r ${catColors[cat]}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {(() => { const I = catIcons[cat]; return I ? <I className="w-3.5 h-3.5" /> : null; })()}
                      <span className="text-xs font-medium">{CATEGORY_NAMES[cat]}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="bg-white/20 text-white text-[9px]">
                        {items.reduce((s, m) => s + (m.totalPrice || 0), 0).toLocaleString('ru-RU')} ₽
                      </Badge>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded.has(cat) ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {expanded.has(cat) && (
                    <div className="max-h-48 sm:max-h-56 overflow-auto">
                      {items.map((m, i) => (
                        <div key={i} className="p-1.5 sm:p-2 border-b last:border-b-0 flex justify-between items-center gap-2 text-[10px] sm:text-xs hover:bg-slate-50">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800 truncate">{m.name}</div>
                            <div className="text-slate-400 truncate">{m.notes}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-orange-600">{m.quantity.toLocaleString('ru-RU')} {m.unit}</div>
                            <div className="text-slate-500 flex items-center gap-1">
                              <input
                                type="number"
                                defaultValue={m.unitPrice}
                                onChange={e => updatePrice(m.name, Number(e.target.value))}
                                className="w-10 sm:w-12 text-right border rounded px-1 py-0.5 text-[9px] sm:text-xs"
                              />
                              ₽ = <span className="font-semibold text-blue-600">{m.totalPrice?.toLocaleString('ru-RU')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 bg-white rounded-xl shadow-lg p-2 border border-slate-200">
          <Button 
            onClick={calculate} 
            disabled={loading} 
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white h-9 sm:h-11 font-semibold shadow text-sm"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-1 sm:mr-2 animate-spin" />Расчёт...</>
            ) : (
              <><Calculator className="w-4 h-4 mr-1 sm:mr-2" />Рассчитать</>
            )}
          </Button>
          {result && (
            <>
              <Button onClick={exportExcel} variant="outline" size="icon" className="border-green-300 text-green-600 hover:bg-green-50 h-9 w-9 sm:h-11 sm:w-11" title="Excel">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button onClick={exportPDF} variant="outline" size="icon" className="border-red-300 text-red-600 hover:bg-red-50 h-9 w-9 sm:h-11 sm:w-11" title="PDF">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Interactive House Preview - фотореалистичный
function InteractiveHousePreview({ 
  params, activeElement, onElementClick, tooltipPos, svgRef 
}: { 
  params: HouseFormParams; 
  activeElement: string | null;
  onElementClick: (element: string, e: React.MouseEvent) => void;
  tooltipPos: { x: number; y: number };
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const len = +params.length || 10;
  const wid = +params.width || 8;
  const fl = +params.floors || 1;
  const fh = +params.floorHeight || 2.7;
  const roofAngle = +params.roofAngle || 30;
  const smallWindows = +params.smallWindows || 0;
  const mediumWindows = +params.mediumWindows || 0;
  const largeWindows = +params.largeWindows || 0;
  const externalDoors = +params.externalDoors || 1;
  const totalWindows = smallWindows + mediumWindows + largeWindows;
  
  const houseWidth = Math.min(220, len * 16);
  const houseHeight = Math.min(110, fl * fh * 20);
  const roofHeight = Math.max(30, houseWidth * 0.28 * Math.tan(roofAngle * Math.PI / 180));
  const svgWidth = houseWidth + 60;
  const svgHeight = houseHeight + roofHeight + 50;
  
  const isActive = (el: string) => activeElement === el;
  
  // Цвета в зависимости от выбора
  const getRoofColor = () => {
    if (params.roofingMaterial === 'metal') return { main: '#6366f1', dark: '#4338ca', light: '#818cf8' };
    if (params.roofingMaterial === 'shingle') return { main: '#78716c', dark: '#57534e', light: '#a8a29e' };
    return { main: '#dc2626', dark: '#b91c1c', light: '#ef4444' }; // profile
  };
  
  const getWallColor = () => {
    if (params.exteriorFinish === 'siding') return { main: '#fef3c7', dark: '#fbbf24', accent: '#f59e0b' };
    if (params.exteriorFinish === 'blockhouse') return { main: '#d4a574', dark: '#a67c52', accent: '#8b6914' };
    return { main: '#e5e7eb', dark: '#9ca3af', accent: '#6b7280' }; // plaster
  };
  
  const getFoundationColor = () => {
    if (params.foundationType === 'strip') return { main: '#6b7280', dark: '#4b5563' };
    if (params.foundationType === 'pile') return { main: '#78716c', dark: '#57534e' };
    return { main: '#9ca3af', dark: '#6b7280' }; // slab
  };
  
  const roofColors = getRoofColor();
  const wallColors = getWallColor();
  const foundationColors = getFoundationColor();
  
  // Параметры окон и дверей
  const doorWidth = 24;
  const doorHeight = 38;
  const doorX = 25 + houseWidth / 2 - doorWidth / 2;
  const doorY = svgHeight - 25 - doorHeight;
  
  // Окна рассчитываем динамически
  const windowWidth = 20;
  const windowHeight = 24;
  const windowGap = 6;
  
  // Генерация позиций окон
  const generateWindows = () => {
    const windows: { x: number; y: number; w: number; h: number }[] = [];
    let currentX = 35;
    const y = svgHeight - 28 - houseHeight + 15;
    
    // Малые окна
    for (let i = 0; i < Math.min(smallWindows, 2); i++) {
      if (currentX + windowWidth < doorX - 5) {
        windows.push({ x: currentX, y, w: windowWidth * 0.8, h: windowHeight * 0.9 });
        currentX += windowWidth * 0.8 + windowGap;
      }
    }
    
    // Средние окна
    for (let i = 0; i < Math.min(mediumWindows, 2); i++) {
      if (currentX + windowWidth < doorX - 5) {
        windows.push({ x: currentX, y, w: windowWidth, h: windowHeight });
        currentX += windowWidth + windowGap;
      }
    }
    
    // Большие окна
    for (let i = 0; i < Math.min(largeWindows, 1); i++) {
      if (currentX + windowWidth * 1.3 < doorX - 5) {
        windows.push({ x: currentX, y, w: windowWidth * 1.3, h: windowHeight * 1.2 });
        currentX += windowWidth * 1.3 + windowGap;
      }
    }
    
    // Окна справа от двери
    currentX = doorX + doorWidth + 10;
    for (let i = windows.length; i < totalWindows && i < 5; i++) {
      if (currentX + windowWidth < 25 + houseWidth - 5) {
        windows.push({ x: currentX, y, w: windowWidth, h: windowHeight });
        currentX += windowWidth + windowGap;
      }
    }
    
    return windows;
  };
  
  const windows = generateWindows();
  
  return (
    <div className="bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-50 rounded-xl p-2 sm:p-3 border border-sky-200 shadow-sm">
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <div className="flex items-center gap-1">
          <div className="bg-sky-500/20 p-0.5 sm:p-1 rounded"><Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-600" /></div>
          <span className="text-[10px] sm:text-xs font-semibold text-sky-700">Интерактивный проект</span>
        </div>
        <div className="text-[9px] sm:text-[10px] text-sky-500 flex items-center gap-0.5">
          <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          Нажмите на элемент
        </div>
      </div>
      
      <div className="relative">
        <svg ref={svgRef} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-32 sm:h-40 md:h-48 rounded-lg overflow-hidden">
          <defs>
            {/* Градиенты неба */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
            
            {/* Градиент травы */}
            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            
            {/* Градиент стен */}
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={wallColors.main} />
              <stop offset="50%" stopColor={wallColors.dark} />
              <stop offset="100%" stopColor={wallColors.accent} />
            </linearGradient>
            
            {/* Градиент крыши */}
            <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={roofColors.light} />
              <stop offset="50%" stopColor={roofColors.main} />
              <stop offset="100%" stopColor={roofColors.dark} />
            </linearGradient>
            
            {/* Градиент фундамента */}
            <linearGradient id="foundationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={foundationColors.main} />
              <stop offset="100%" stopColor={foundationColors.dark} />
            </linearGradient>
            
            {/* Тень */}
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="2" dy="4" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Паттерн кирпича */}
            <pattern id="brickPattern" patternUnits="userSpaceOnUse" width="20" height="10">
              <rect width="20" height="10" fill="#9ca3af" />
              <rect x="0" y="0" width="9" height="4" fill="#6b7280" rx="0.5" />
              <rect x="11" y="0" width="9" height="4" fill="#6b7280" rx="0.5" />
              <rect x="5" y="5" width="9" height="4" fill="#6b7280" rx="0.5" />
            </pattern>
            
            {/* Паттерн дерева */}
            <pattern id="woodPattern" patternUnits="userSpaceOnUse" width="8" height="20">
              <rect width="8" height="20" fill="#d4a574" />
              <line x1="2" y1="0" x2="2" y2="20" stroke="#a67c52" strokeWidth="0.5" opacity="0.5" />
              <line x1="6" y1="0" x2="6" y2="20" stroke="#a67c52" strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
          
          {/* Небо */}
          <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#skyGrad)" />
          
          {/* Солнце с лучами */}
          <g>
            <circle cx={svgWidth - 25} cy="22" r="16" fill="#fcd34d" opacity="0.9" />
            <circle cx={svgWidth - 25} cy="22" r="20" fill="#fcd34d" opacity="0.3" />
            {/* Лучи */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line 
                key={i}
                x1={svgWidth - 25 + 24 * Math.cos(angle * Math.PI / 180)}
                y1={22 + 24 * Math.sin(angle * Math.PI / 180)}
                x2={svgWidth - 25 + 30 * Math.cos(angle * Math.PI / 180)}
                y2={22 + 30 * Math.sin(angle * Math.PI / 180)}
                stroke="#fcd34d"
                strokeWidth="2"
                opacity="0.6"
              />
            ))}
          </g>
          
          {/* Облака */}
          <g opacity="0.8">
            <ellipse cx="35" cy="18" rx="18" ry="10" fill="white"/>
            <ellipse cx="50" cy="15" rx="14" ry="8" fill="white"/>
            <ellipse cx="25" cy="16" rx="12" ry="7" fill="white"/>
            <ellipse cx={svgWidth - 80} cy="35" rx="15" ry="8" fill="white" opacity="0.6"/>
          </g>
          
          {/* Трава */}
          <rect x="0" y={svgHeight - 22} width={svgWidth} height="22" fill="url(#grassGrad)" />
          
          {/* Фундамент */}
          <g onClick={(e) => onElementClick('foundation', e)} className="cursor-pointer" filter="url(#dropShadow)">
            <rect 
              x={22} y={svgHeight - 27} 
              width={houseWidth + 16} height="12" 
              fill={isActive('foundation') ? '#f97316' : 'url(#foundationGrad)'} 
              stroke={foundationColors.dark}
              strokeWidth="1"
              rx="1"
            />
            {/* Текстура фундамента */}
            <line x1="30" y1={svgHeight - 27} x2="30" y2={svgHeight - 15} stroke={foundationColors.dark} strokeWidth="0.5" opacity="0.5" />
            <line x1="50" y1={svgHeight - 27} x2="50" y2={svgHeight - 15} stroke={foundationColors.dark} strokeWidth="0.5" opacity="0.5" />
            <line x1={22 + houseWidth} y1={svgHeight - 27} x2={22 + houseWidth} y2={svgHeight - 15} stroke={foundationColors.dark} strokeWidth="0.5" opacity="0.5" />
          </g>
          
          {/* Стены */}
          <g onClick={(e) => onElementClick('walls', e)} className="cursor-pointer" filter="url(#dropShadow)">
            <rect 
              x={25} y={svgHeight - 27 - houseHeight} 
              width={houseWidth + 10} height={houseHeight} 
              fill={isActive('walls') ? '#f97316' : 'url(#wallGrad)'} 
              stroke={wallColors.dark}
              strokeWidth="1.5"
              rx="1"
            />
            {/* Текстура стен (сайдинг) */}
            {params.exteriorFinish === 'siding' && [...Array(Math.floor(houseHeight / 6))].map((_, i) => (
              <line 
                key={i}
                x1="25" 
                y1={svgHeight - 27 - houseHeight + i * 6 + 3} 
                x2={25 + houseWidth + 10} 
                y2={svgHeight - 27 - houseHeight + i * 6 + 3} 
                stroke={wallColors.dark} 
                strokeWidth="0.3" 
                opacity="0.3"
              />
            ))}
          </g>
          
          {/* Крыша в зависимости от типа */}
          <g onClick={(e) => onElementClick('roof', e)} className="cursor-pointer" filter="url(#dropShadow)">
            {params.roofType === 'gable' ? (
              // Двускатная крыша
              <polygon 
                points={`18,${svgHeight - 27 - houseHeight} ${30 + houseWidth/2},${svgHeight - 27 - houseHeight - roofHeight} ${42 + houseWidth},${svgHeight - 27 - houseHeight}`}
                fill={isActive('roof') ? '#f97316' : 'url(#roofGrad)'} 
                stroke={roofColors.dark}
                strokeWidth="2"
              />
            ) : params.roofType === 'shed' ? (
              // Односкатная крыша
              <polygon 
                points={`18,${svgHeight - 27 - houseHeight} ${42 + houseWidth},${svgHeight - 27 - houseHeight - roofHeight * 0.5} ${42 + houseWidth},${svgHeight - 27 - houseHeight}`}
                fill={isActive('roof') ? '#f97316' : 'url(#roofGrad)'} 
                stroke={roofColors.dark}
                strokeWidth="2"
              />
            ) : (
              // Вальмовая крыша (четырехскатная)
              <g>
                <polygon 
                  points={`18,${svgHeight - 27 - houseHeight} ${30 + houseWidth/2},${svgHeight - 27 - houseHeight - roofHeight * 0.85} ${42 + houseWidth},${svgHeight - 27 - houseHeight}`}
                  fill={isActive('roof') ? '#f97316' : 'url(#roofGrad)'} 
                  stroke={roofColors.dark}
                  strokeWidth="2"
                />
                {/* Дополнительные скаты вальмовой крыши */}
                <polygon 
                  points={`18,${svgHeight - 27 - houseHeight} ${30 + houseWidth/2},${svgHeight - 27 - houseHeight - roofHeight * 0.85} ${30 + houseWidth/2},${svgHeight - 27 - houseHeight}`}
                  fill={roofColors.dark}
                  opacity="0.3"
                />
                <polygon 
                  points={`${42 + houseWidth},${svgHeight - 27 - houseHeight} ${30 + houseWidth/2},${svgHeight - 27 - houseHeight - roofHeight * 0.85} ${30 + houseWidth/2},${svgHeight - 27 - houseHeight}`}
                  fill={roofColors.dark}
                  opacity="0.3"
                />
              </g>
            )}
            
            {/* Труба */}
            {params.hasAttic && (
              <rect 
                x={25 + houseWidth * 0.65} 
                y={svgHeight - 27 - houseHeight - roofHeight * 0.5} 
                width="14" 
                height="25" 
                fill="#78716c"
                stroke="#57534e"
                strokeWidth="1"
              />
            )}
          </g>
          
          {/* Окна */}
          <g onClick={(e) => onElementClick('windows', e)} className="cursor-pointer">
            {windows.map((w, i) => (
              <g key={i}>
                <rect 
                  x={w.x} y={w.y} 
                  width={w.w} height={w.h} 
                  fill={isActive('windows') ? '#f97316' : '#bfdbfe'} 
                  stroke="#3b82f6" 
                  strokeWidth="1.5" 
                  rx="1"
                />
                {/* Рамы окна */}
                <line x1={w.x + w.w/2} y1={w.y} x2={w.x + w.w/2} y2={w.y + w.h} stroke="#3b82f6" strokeWidth="0.8" />
                <line x1={w.x} y1={w.y + w.h/2} x2={w.x + w.w} y2={w.y + w.h/2} stroke="#3b82f6" strokeWidth="0.8" />
                {/* Блики на стекле */}
                <rect x={w.x + 2} y={w.y + 2} width={w.w/3} height={w.h/3} fill="white" opacity="0.3" rx="0.5" />
              </g>
            ))}
            
            {/* Окно мансарды */}
            {params.hasAttic && (
              <circle 
                cx={30 + houseWidth/2} 
                cy={svgHeight - 27 - houseHeight - roofHeight * 0.4} 
                r="10" 
                fill={isActive('windows') ? '#f97316' : '#bfdbfe'}
                stroke="#3b82f6"
                strokeWidth="1.5"
              />
            )}
          </g>
          
          {/* Двери */}
          <g onClick={(e) => onElementClick('door', e)} className="cursor-pointer">
            <rect 
              x={doorX} y={doorY} 
              width={doorWidth} height={doorHeight} 
              fill={isActive('door') ? '#f97316' : '#854d0e'} 
              stroke="#713f12"
              strokeWidth="1.5"
              rx="1"
            />
            {/* Панели двери */}
            <rect x={doorX + 3} y={doorY + 3} width={doorWidth - 6} height={doorHeight / 2 - 5} fill="none" stroke="#713f12" strokeWidth="0.8" rx="1" />
            <rect x={doorX + 3} y={doorY + doorHeight / 2 + 2} width={doorWidth - 6} height={doorHeight / 2 - 5} fill="none" stroke="#713f12" strokeWidth="0.8" rx="1" />
            {/* Ручка */}
            <circle cx={doorX + doorWidth - 6} cy={doorY + doorHeight / 2} r="2.5" fill="#fbbf24" />
          </g>
          
          {/* Деревья */}
          <g opacity="0.9">
            {/* Левое дерево */}
            <rect x={8} y={svgHeight - 30} width="5" height="12" fill="#854d0e" />
            <polygon points={`10,${svgHeight - 50} 0,${svgHeight - 18} 20,${svgHeight - 18}`} fill="#22c55e" />
            <polygon points={`10,${svgHeight - 40} 3,${svgHeight - 25} 17,${svgHeight - 25}`} fill="#16a34a" />
            
            {/* Правое дерево */}
            <rect x={svgWidth - 18} y={svgHeight - 30} width="5" height="12" fill="#854d0e" />
            <polygon points={`${svgWidth - 15},${svgHeight - 50} ${svgWidth - 25},${svgHeight - 18} ${svgWidth - 5},${svgHeight - 18}`} fill="#22c55e" />
            <polygon points={`${svgWidth - 15},${svgHeight - 40} ${svgWidth - 22},${svgHeight - 25} ${svgWidth - 8},${svgHeight - 25}`} fill="#16a34a" />
          </g>
          
          {/* Второй этаж (если есть) */}
          {fl > 1 && (
            <g>
              {/* Дополнительные окна второго этажа */}
              <rect x={35} y={svgHeight - 27 - houseHeight + houseHeight/2 + 10} width={18} height={22} fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5" rx="1" />
              <rect x={houseWidth - 5} y={svgHeight - 27 - houseHeight + houseHeight/2 + 10} width={18} height={22} fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5" rx="1" />
              {/* Линия между этажами */}
              <line x1="25" y1={svgHeight - 27 - houseHeight + houseHeight/fl} x2={35 + houseWidth} y2={svgHeight - 27 - houseHeight + houseHeight/fl} stroke={wallColors.dark} strokeWidth="1" opacity="0.5" />
            </g>
          )}
        </svg>
        
        {/* Tooltip */}
        {activeElement && houseElementLabels[activeElement] && (
          <div className="absolute bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-1.5 sm:p-2 text-[9px] sm:text-xs max-w-[180px] sm:max-w-[200px] border border-sky-200 animate-in fade-in zoom-in-95 duration-200"
            style={{ left: Math.min(tooltipPos.x, 150), top: tooltipPos.y - 50, transform: 'translateX(-50%)' }}>
            <div className="flex items-center gap-1 text-sky-600 font-medium mb-0.5">
              <Info className="w-2.5 h-2.5" />
              {activeElement === 'roof' ? 'Крыша' : 
               activeElement === 'walls' ? 'Стены' :
               activeElement === 'windows' ? 'Окна' :
               activeElement === 'door' ? 'Двери' :
               activeElement === 'foundation' ? 'Фундамент' : activeElement}
            </div>
            <div className="text-slate-600">{houseElementLabels[activeElement](params)}</div>
          </div>
        )}
      </div>
      
      {/* Badges */}
      <div className="flex gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
        <Badge className="bg-amber-100 text-amber-700 text-[8px] sm:text-[10px] border border-amber-200">
          {fl} эт.
        </Badge>
        <Badge className="bg-green-100 text-green-700 text-[8px] sm:text-[10px] border border-green-200">
          {len * wid} м²
        </Badge>
        <Badge className="bg-blue-100 text-blue-700 text-[8px] sm:text-[10px] border border-blue-200">
          {params.roofType === 'gable' ? 'Двускатная' : params.roofType === 'hip' ? 'Вальмовая' : 'Односкатная'}
        </Badge>
        <Badge className="bg-purple-100 text-purple-700 text-[8px] sm:text-[10px] border border-purple-200">
          {params.foundationType === 'strip' ? 'Ленточный' : params.foundationType === 'pile' ? 'Свайный' : 'Плитный'}
        </Badge>
        <Badge className="bg-cyan-100 text-cyan-700 text-[8px] sm:text-[10px] border border-cyan-200">
          {params.insulationType === 'mineral' ? 'Минвата' : params.insulationType === 'eco' ? 'Эковата' : 'Пенопласт'}
        </Badge>
      </div>
    </div>
  );
}

// Form Section Expanded (на всю ширину)
function FormSectionExpanded({ title, icon: Icon, color, children, onClose }: { 
  title: string; icon: React.ElementType; color: string; children: React.ReactNode; onClose: () => void;
}) {
  return (
    <div className="border rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <button onClick={onClose} className={`w-full p-2 sm:p-2.5 text-white flex justify-between items-center bg-gradient-to-r ${color}`}>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium">{title}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" />
      </button>
      <div className="p-2 sm:p-3">{children}</div>
    </div>
  );
}

// Form Section Button (закрытая секция)
function FormSectionButton({ title, icon: Icon, color, onClick }: { 
  title: string; icon: React.ElementType; color: string; onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-2 sm:p-2.5 text-white rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 bg-gradient-to-r ${color} hover:opacity-90 transition-opacity shadow-sm`}
    >
      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      <span className="text-[10px] sm:text-xs font-medium">{title}</span>
      <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 -rotate-90" />
    </button>
  );
}

// Field
function Field({ label, value, onChange, options }: { 
  label: string; value: string; onChange: (v: string) => void; options?: {value: string, label: string}[];
}) {
  return (
    <div className="space-y-0.5">
      <Label className="text-[9px] sm:text-[10px] text-slate-500">{label}</Label>
      {options ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-7 sm:h-8 text-[10px] sm:text-xs bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            {options.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-[10px] sm:text-xs">{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <Input value={value} onChange={e => onChange(e.target.value)} className="h-7 sm:h-8 text-[10px] sm:text-xs" type="number" min="0" />
      )}
    </div>
  );
}
