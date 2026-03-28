import { ShipperAd } from '@/types';

// Food City Moscow approximate center
const FC_LAT = 55.5773;
const FC_LNG = 37.4958;

function jitter(i: number) {
  const lat = FC_LAT + ((i % 6) - 2.5) * 0.01 + (i * 0.00031);
  const lng = FC_LNG + (Math.floor(i / 6) - 2.5) * 0.012 + (i * 0.00027);
  return { lat, lng };
}

export const foodCityAds: ShipperAd[] = Array.from({ length: 30 }).map((_, i) => {
  const n = i + 1;
  const { lat, lng } = jitter(n);
  const cargos = [
    'Фрукты (яблоки, груши)',
    'Овощи (картофель, капуста)',
    'Ягоды (клубника, черника)',
    'Зелень (салаты, укроп)',
    'Цитрусовые (апельсины, лимоны)',
    'Бананы и манго',
    'Молочная продукция',
    'Мясо охлажденное',
    'Рыба охлажденная',
    'Сухофрукты и орехи',
    'Замороженная продукция',
    'Хлебобулочные изделия',
    'Кондитерские изделия',
    'Напитки (соки, воды)',
    'Консервированная продукция',
    'Крупы и макароны',
    'Мясная гастрономия',
    'Сыры и деликатесы',
    'Морепродукты',
    'Яйца куриные',
    'Масла растительные',
    'Специи и приправы',
    'Детское питание',
    'Орехи и сухофрукты',
    'Чай и кофе',
    'Замороженные овощи',
    'Мороженое',
    'Полуфабрикаты',
    'Готовые салаты',
    'Свежая выпечка',
  ];
  const cargoType = cargos[i % cargos.length];

  const price = 15000 + i * 2000;
  const tonnage = 1 + (i % 5) * 2;

  return {
    id: `fc-ad-${n}`,
    shipperId: `fc-shipper-${n}`,
    shipperRating: 4.3 + ((i * 7) % 10) / 10,
    shipperCompany: {
      name: `ООО "ФудСити Поставки ${n}`,
      inn: `770${1000000 + n}`,
      kpp: `7701${1000 + n}`,
      ogrn: `10277000${1000 + n}`,
      legalAddress: 'г. Москва, Калужское ш., 1, Фуд Сити',
      actualAddress: 'г. Москва, Калужское ш., 1, Фуд Сити, склад А',
      bankName: 'ПАО "Сбербанк"',
      bankAccount: `40702810${100000000 + n}`,
      managerName: `Менеджер ${n}`,
      phone: '+7 (495) 000-00-00',
      email: `manager${n}@foodcity.ru`,
    },
    origin: {
      address: 'Фуд Сити, Калужское ш., 1',
      lat,
      lng,
      city: 'Москва',
    },
    destination: {
      address: `Москва, ТТК, склад №${n}`,
      lat: 55.75 + (i % 3) * 0.02,
      lng: 37.6 + (i % 4) * 0.03,
      city: 'Москва',
    },
    cargoType,
    tonnage,
    distance: 25 + i * 3,
    price,
    includesVAT: i % 2 === 0,
    insurance: Math.round(price * 0.05),
    aggregatorCommission: Math.round(price * 0.05),
    transportMode: 'refrigerator',
    requiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (i + 1)).toISOString(),
    paymentMethod: (['prepayment', 'card', 'by_invoice', 'cash'] as const)[i % 4],
    detailedDescription: 'Доставка свежей продукции из Фуд Сити по Москве и области. Нужен аккуратный водитель и соблюдение температурного режима.',
    cargoDetails: 'Продукция на поддонах, необходима бережная перевозка. Паллеты европаллет 120x80.',
    specialRequirements: 'Рефрижератор с температурой +2°C…+6°C. Чистый кузов.',
    loadingInfo: 'Погрузка с рампы, погрузчики на месте.',
    unloadingInfo: 'Разгрузка на складе получателя, есть рампа.',
    createdAt: new Date().toISOString(),
    status: 'active',
  };
});
