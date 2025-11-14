import { Stack, useLocalSearchParams } from 'expo-router';
import { Download, FileText, Paperclip, PenTool, CheckCircle2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Image,
} from 'react-native';

import Colors from '@/constants/colors';
import { mockOrders } from '@/mocks/orders';
import SignaturePad from '@/components/SignaturePad';
import { DocumentSignature } from '@/types';
import { useRole } from '@/contexts/RoleContext';

const TRANSPORT_MODE_NAMES: Record<string, string> = {
  truck: 'Грузовик',
  van: 'Фургон',
  refrigerator: 'Рефрижератор',
  container: 'Контейнеровоз',
  tanker: 'Цистерна',
  flatbed: 'Бортовой',
};

const PAYMENT_METHOD_NAMES: Record<string, string> = {
  prepayment: 'Предоплата',
  postpayment: 'Постоплата',
  by_invoice: 'По счету',
  cash: 'Наличные',
  card: 'Карта',
};

const CONTRACT_TEMPLATE = `
═══════════════════════════════════════════════════════════════════════════════
                            ДОГОВОР ПЕРЕВОЗКИ ГРУЗА
                                  №{CONTRACT_NUMBER}
═══════════════════════════════════════════════════════════════════════════════

г. Москва                                                {CONTRACT_DATE}


    Заказчик: {SHIPPER_COMPANY}
    ИНН: {INN}, КПП: {KPP}, ОГРН: {OGRN}
    Юридический адрес: {LEGAL_ADDRESS}

    и

    Перевозчик: {CARRIER_NAME}
    {CARRIER_INFO}

    (в дальнейшем именуемые "Стороны")


заключили настоящий Договор о нижеследующем:


───────────────────────────────────────────────────────────────────────────────
  1. ПРЕДМЕТ ДОГОВОРА
───────────────────────────────────────────────────────────────────────────────

1.1. Перевозчик обязуется доставить вверенный ему Заказчиком груз в пункт 
     назначения и выдать его уполномоченному на получение груза лицу 
     (получателю), а Заказчик обязуется уплатить за перевозку установленную 
     настоящим Договором плату.

1.2. Настоящий договор регулируется Гражданским кодексом Российской Федерации,
     Уставом автомобильного транспорта и иными нормативными актами РФ.


───────────────────────────────────────────────────────────────────────────────
  2. ИНФОРМАЦИЯ О ГРУЗЕ
───────────────────────────────────────────────────────────────────────────────

2.1. Наименование груза:        {CARGO_TYPE}
2.2. Вес груза:                 {WEIGHT} кг
2.3. Объем груза:               {VOLUME} м³
2.4. Тип транспортного средства: {TRANSPORT_MODE}
2.5. Упаковка груза:            Согласно спецификации
2.6. Стоимость груза:           Согласно товарной накладной


───────────────────────────────────────────────────────────────────────────────
  3. МАРШРУТ ПЕРЕВОЗКИ
───────────────────────────────────────────────────────────────────────────────

3.1. ПУНКТ ПОГРУЗКИ:
     Адрес:           {ORIGIN_ADDRESS}
     Контактное лицо: {ORIGIN_CONTACT_NAME}
     Телефон:         {ORIGIN_CONTACT_PHONE}
     Дата и время:    Согласно графику погрузки

3.2. ПУНКТ РАЗГРУЗКИ:
     Адрес:           {DESTINATION_ADDRESS}
     Контактное лицо: {DESTINATION_CONTACT_NAME}
     Телефон:         {DESTINATION_CONTACT_PHONE}
     Срок доставки:   до {REQUIRED_DATE}

3.3. Расстояние перевозки: {DISTANCE} км

3.4. Маршрут следования: Определяется Перевозчиком самостоятельно с 
     соблюдением срока доставки, установленного п. 3.2 настоящего Договора.


───────────────────────────────────────────────────────────────────────────────
  4. СТОИМОСТЬ УСЛУГ И ПОРЯДОК РАСЧЕТОВ
───────────────────────────────────────────────────────────────────────────────

4.1. Общая стоимость перевозки груза составляет:

     Базовая стоимость (без НДС):         {BASE_PRICE} руб.
     НДС (20%):                           {VAT_AMOUNT} руб.
     ─────────────────────────────────────────────────────────
     Стоимость с НДС:                     {PRICE_WITH_VAT} руб.
     
     Страхование груза (5%):              {INSURANCE} руб.
     Комиссия агрегатора (5%):            {COMMISSION} руб.
     ─────────────────────────────────────────────────────────
     ИТОГО К ОПЛАТЕ:                      {FINAL_PRICE} руб.

4.2. Способ оплаты: {PAYMENT_METHOD}

4.3. Оплата производится в следующем порядке:
     - При способе оплаты "Предоплата": 100% до начала перевозки
     - При способе оплаты "Постоплата": 100% в течение 5 банковских дней 
       после получения груза
     - При способе оплаты "По счету": согласно выставленному счету

4.4. В стоимость перевозки включены:
     - Погрузочно-разгрузочные работы
     - Страхование груза
     - Все дорожные расходы (топливо, платные дороги)
     - Оформление необходимых документов

4.5. Дополнительные расходы:
     Простой транспортного средства сверх 2 часов оплачивается отдельно 
     по ставке 500 руб./час.


───────────────────────────────────────────────────────────────────────────────
  5. ПРАВА И ОБЯЗАННОСТИ СТОРОН
───────────────────────────────────────────────────────────────────────────────

5.1. ПЕРЕВОЗЧИК ОБЯЗАН:

     5.1.1. Предоставить исправное транспортное средство, соответствующее 
            типу и характеру груза.
     
     5.1.2. Обеспечить сохранность груза с момента приемки до момента 
            выдачи получателю.
     
     5.1.3. Доставить груз в пункт назначения в установленный срок.
     
     5.1.4. Предоставить водителя с необходимыми документами и разрешениями.
     
     5.1.5. Оформить и передать Заказчику следующие документы:
            - Товарно-транспортную накладную
            - Акт приема-передачи груза
            - Счет-фактуру (при необходимости)
            - УПД (универсальный передаточный документ)
     
     5.1.6. Оформить страхование груза на сумму {INSURANCE} руб.
     
     5.1.7. Немедленно уведомлять Заказчика о любых происшествиях с грузом.
     
     5.1.8. Соблюдать температурный режим (если требуется для данного груза).

5.2. ПЕРЕВОЗЧИК ИМЕЕТ ПРАВО:

     5.2.1. Требовать от Заказчика своевременной оплаты услуг.
     
     5.2.2. Отказаться от перевозки груза, если он не соответствует 
            указанным в документах характеристикам.
     
     5.2.3. Самостоятельно выбирать маршрут перевозки с соблюдением 
            установленных сроков.

5.3. ЗАКАЗЧИК ОБЯЗАН:

     5.3.1. Предоставить груз для перевозки в надлежащем состоянии и упаковке.
     
     5.3.2. Обеспечить доступ транспортного средства к месту погрузки.
     
     5.3.3. Предоставить полную и достоверную информацию о грузе, включая:
            - Точное наименование груза
            - Вес и объем
            - Особые условия перевозки (если имеются)
            - Документы на груз
     
     5.3.4. Оплатить услуги перевозки в установленные сроки и порядке.
     
     5.3.5. Обеспечить присутствие уполномоченного лица при погрузке.
     
     5.3.6. Уведомить получателя о предстоящей доставке груза.

5.4. ЗАКАЗЧИК ИМЕЕТ ПРАВО:

     5.4.1. Требовать своевременной доставки груза в сохранности.
     
     5.4.2. Контролировать местонахождение груза в процессе перевозки.
     
     5.4.3. Получать информацию о ходе выполнения заказа.


───────────────────────────────────────────────────────────────────────────────
  6. ОТВЕТСТВЕННОСТЬ СТОРОН
───────────────────────────────────────────────────────────────────────────────

6.1. За утрату, недостачу или повреждение груза Перевозчик несет 
     ответственность в размере действительной стоимости груза, но не более 
     суммы страхования {INSURANCE} руб.

6.2. Перевозчик освобождается от ответственности, если докажет, что утрата,
     недостача или повреждение груза произошли вследствие:
     
     6.2.1. Действия непреодолимой силы (форс-мажор);
     6.2.2. Естественных свойств груза или скрытых недостатков упаковки;
     6.2.3. Нарушения Заказчиком обязанностей по подготовке груза;
     6.2.4. Действий получателя груза или третьих лиц.

6.3. За просрочку доставки груза Перевозчик уплачивает Заказчику неустойку 
     в размере 0,5% от стоимости перевозки за каждый день просрочки, но 
     не более 10% от общей стоимости услуг по настоящему Договору.

6.4. За невыполнение или ненадлежащее выполнение обязательств по оплате
     Заказчик уплачивает Перевозчику пени в размере 0,1% от неоплаченной 
     суммы за каждый день просрочки.

6.5. При обнаружении повреждения или недостачи груза Стороны составляют 
     коммерческий акт в течение 24 часов с момента обнаружения.

6.6. Возмещение ущерба не освобождает виновную Сторону от выполнения 
     своих обязательств по настоящему Договору.


───────────────────────────────────────────────────────────────────────────────
  7. СТРАХОВАНИЕ ГРУЗА
───────────────────────────────────────────────────────────────────────────────

7.1. Груз подлежит обязательному страхованию на сумму {INSURANCE} руб.

7.2. Страхование осуществляется Перевозчиком за счет средств, указанных 
     в п. 4.1 настоящего Договора (страховая премия включена в стоимость).

7.3. Страхование покрывает следующие риски:
     - Утрата или недостача груза
     - Повреждение груза при транспортировке
     - ДТП с участием транспортного средства
     - Стихийные бедствия

7.4. В случае наступления страхового случая Перевозчик обязан:
     - Немедленно уведомить страховую компанию и Заказчика
     - Принять меры по минимизации ущерба
     - Оформить все необходимые документы для получения страхового возмещения

7.5. Выплата страхового возмещения производится страховой компанией 
     в соответствии с условиями договора страхования.

7.6. Копия страхового полиса предоставляется Заказчику по запросу.


───────────────────────────────────────────────────────────────────────────────
  8. ПОРЯДОК ПРИЕМКИ И СДАЧИ ГРУЗА
───────────────────────────────────────────────────────────────────────────────

8.1. Груз принимается к перевозке в пункте погрузки при наличии:
     - Товарно-транспортной накладной
     - Товарной накладной или счета-фактуры
     - Иных документов, предусмотренных законодательством

8.2. При приемке груза проверяются:
     - Соответствие груза сопроводительным документам
     - Количество мест
     - Состояние упаковки
     - Масса груза (при необходимости)

8.3. Факт приемки груза подтверждается подписями обеих Сторон в ТТН.

8.4. Груз выдается получателю при предъявлении:
     - Доверенности на получение груза
     - Паспорта или иного документа, удостоверяющего личность

8.5. При выдаче груза получатель обязан:
     - Проверить количество мест
     - Осмотреть упаковку на наличие повреждений
     - Расписаться в получении груза в ТТН

8.6. Претензии к количеству и состоянию груза принимаются только при 
     приемке. После подписания документов о приемке груза претензии 
     не принимаются, за исключением скрытых недостатков.

8.7. При обнаружении повреждения, недостачи или несоответствия груза 
     составляется Акт (коммерческий акт) с участием:
     - Представителя Перевозчика
     - Представителя Заказчика (или получателя)
     - При необходимости: представителя страховой компании


───────────────────────────────────────────────────────────────────────────────
  9. ОСОБЫЕ УСЛОВИЯ
───────────────────────────────────────────────────────────────────────────────

{SPECIAL_CONDITIONS}


───────────────────────────────────────────────────────────────────────────────
  10. ФОРС-МАЖОР
───────────────────────────────────────────────────────────────────────────────

10.1. Стороны освобождаются от ответственности за частичное или полное 
      неисполнение обязательств по настоящему Договору, если оно явилось 
      следствием обстоятельств непреодолимой силы (форс-мажор).

10.2. К обстоятельствам непреодолимой силы относятся:
      - Стихийные бедствия
      - Военные действия
      - Эпидемии
      - Террористические акты
      - Забастовки
      - Решения государственных органов

10.3. Сторона, для которой создалась невозможность исполнения обязательств,
      обязана немедленно (не позднее 3 дней) уведомить другую Сторону.

10.4. При прекращении действия форс-мажорных обстоятельств Сторона обязана 
      в течение 5 дней уведомить другую Сторону и возобновить исполнение 
      обязательств.


───────────────────────────────────────────────────────────────────────────────
  11. СРОК ДЕЙСТВИЯ ДОГОВОРА
───────────────────────────────────────────────────────────────────────────────

11.1. Договор вступает в силу с момента подписания обеими Сторонами и 
      действует до полного исполнения Сторонами своих обязательств.

11.2. Договор может быть расторгнут:
      - По соглашению Сторон
      - В одностороннем порядке при существенном нарушении условий 
        другой Стороной (с письменным уведомлением за 10 дней)
      - По решению суда

11.3. Расторжение Договора не освобождает Стороны от исполнения 
      принятых обязательств и ответственности за их нарушение.


───────────────────────────────────────────────────────────────────────────────
  12. ПОРЯДОК РАЗРЕШЕНИЯ СПОРОВ
───────────────────────────────────────────────────────────────────────────────

12.1. Все споры и разногласия, которые могут возникнуть из настоящего 
      Договора или в связи с ним, будут разрешаться путем переговоров 
      между Сторонами.

12.2. В случае невозможности разрешения споров путем переговоров, 
      споры передаются на рассмотрение в Арбитражный суд г. Москвы 
      в соответствии с действующим законодательством РФ.

12.3. Претензионный порядок разрешения споров обязателен.

12.4. Срок рассмотрения претензии - 30 календарных дней с момента 
      получения.

12.5. Претензии направляются заказным письмом с уведомлением или 
      вручаются под роспись.


───────────────────────────────────────────────────────────────────────────────
  13. КОНФИДЕНЦИАЛЬНОСТЬ
───────────────────────────────────────────────────────────────────────────────

13.1. Информация, полученная Сторонами в ходе исполнения настоящего 
      Договора, является конфиденциальной и не подлежит разглашению 
      третьим лицам без письменного согласия другой Стороны.

13.2. Исключение составляет информация:
      - Ставшая общедоступной
      - Требующаяся для предоставления государственным органам
      - Необходимая для судебного разбирательства


───────────────────────────────────────────────────────────────────────────────
  14. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ
───────────────────────────────────────────────────────────────────────────────

14.1. Настоящий Договор составлен в двух экземплярах, имеющих одинаковую 
      юридическую силу, по одному для каждой из Сторон.

14.2. Все изменения и дополнения к настоящему Договору действительны 
      лишь при условии, что они совершены в письменной форме и подписаны 
      уполномоченными представителями обеих Сторон.

14.3. Во всем остальном, что не предусмотрено настоящим Договором, 
      Стороны руководствуются действующим законодательством Российской 
      Федерации.

14.4. Договор составлен на русском языке.

14.5. Неотъемлемой частью настоящего Договора являются:
      - Приложение №1: Спецификация груза
      - Приложение №2: График погрузки/разгрузки
      - Приложение №3: Особые условия перевозки (при наличии)

14.6. Стороны подтверждают, что на момент подписания настоящего Договора 
      они обладают необходимыми полномочиями для заключения настоящего 
      Договора, а их представители действуют на основании учредительных 
      документов и/или доверенностей.


═══════════════════════════════════════════════════════════════════════════════
                       РЕКВИЗИТЫ И ПОДПИСИ СТОРОН
═══════════════════════════════════════════════════════════════════════════════


ЗАКАЗЧИК:                              ПЕРЕВОЗЧИК:

{SHIPPER_COMPANY}                      {CARRIER_NAME}

Юридический адрес:                     Юридический адрес:
{LEGAL_ADDRESS}                        {CARRIER_ADDRESS}

Фактический адрес:                     Фактический адрес:
{ACTUAL_ADDRESS}                       {CARRIER_ACTUAL_ADDRESS}

ИНН: {INN}                             ИНН: {CARRIER_INN}
КПП: {KPP}                             КПП: {CARRIER_KPP}
ОГРН: {OGRN}                           ОГРН: {CARRIER_OGRN}

Банковские реквизиты:                  Банковские реквизиты:
Банк: {BANK_NAME}                      Банк: {CARRIER_BANK}
Р/С: {BANK_ACCOUNT}                    Р/С: {CARRIER_ACCOUNT}
К/С: {CORRESPONDENT_ACCOUNT}           К/С: {CARRIER_CORR_ACCOUNT}
БИК: {BIC}                             БИК: {CARRIER_BIC}

Контактное лицо:                       Контактное лицо:
{MANAGER_NAME}                         {CARRIER_MANAGER}
Тел.: {PHONE}                          Тел.: {CARRIER_PHONE}
Email: {EMAIL}                         Email: {CARRIER_EMAIL}


__________________/{DIRECTOR_NAME}/    __________________/{CARRIER_DIRECTOR}/
      (подпись)                              (подпись)

М.П.                                   М.П.


Дата: {CONTRACT_DATE}                  Дата: {CONTRACT_DATE}


═══════════════════════════════════════════════════════════════════════════════
`;

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role } = useRole();
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatures, setSignatures] = useState<DocumentSignature[]>([]);

  const { document: initialDocument, order } = useMemo(() => {
    let foundDoc = null;
    let foundOrder = null;

    for (const order of mockOrders) {
      const doc = order.documents.find((d) => d.id === id);
      if (doc) {
        foundDoc = doc;
        foundOrder = order;
        break;
      }
    }

    return { document: foundDoc, order: foundOrder };
  }, [id]);

  const document = useMemo(() => {
    if (!initialDocument) return null;
    return {
      ...initialDocument,
      signatures: signatures.length > 0 ? signatures : initialDocument.signatures,
    };
  }, [initialDocument, signatures]);

  const hasUserSigned = useMemo(() => {
    if (!document?.signatures) return false;
    const userRole = role === 'cargo-owner' ? 'shipper' : 'carrier';
    return document.signatures.some(sig => sig.signedByRole === userRole);
  }, [document, role]);

  const handleSignDocument = (signatureData: string) => {
    const userRole = role === 'cargo-owner' ? 'shipper' : 'carrier';
    const newSignature: DocumentSignature = {
      id: `sig-${Date.now()}`,
      signatureData,
      signedBy: userRole === 'shipper' ? 'Грузоотправитель' : 'Перевозчик',
      signedByRole: userRole as 'shipper' | 'carrier' | 'driver',
      signedAt: new Date().toISOString(),
      deviceInfo: Platform.OS,
    };

    setSignatures(prev => [...(document?.signatures || []), ...prev, newSignature]);
    Alert.alert('Успех', 'Документ успешно подписан электронной подписью');
  };

  const contractContent = useMemo(() => {
    if (!document || !order || document.type !== 'contract') {
      return null;
    }

    const basePrice = order.includesVAT ? order.price / 1.2 : order.price;
    const vatAmount = order.includesVAT ? order.price - basePrice : order.price * 0.2;
    const priceWithVat = basePrice + vatAmount;
    const finalPrice = priceWithVat + (order.insurance || 0) + (order.aggregatorCommission || 0);

    let content = CONTRACT_TEMPLATE
      .replace('{CONTRACT_NUMBER}', order.id)
      .replace(/{CONTRACT_DATE}/g, new Date(document.uploadedAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }))
      .replace(/{SHIPPER_COMPANY}/g, order.shipperCompany?.name || 'Не указано')
      .replace(/{INN}/g, order.shipperCompany?.inn || 'Не указано')
      .replace(/{KPP}/g, order.shipperCompany?.kpp || 'Не применяется')
      .replace(/{OGRN}/g, order.shipperCompany?.ogrn || 'Не указано')
      .replace(/{LEGAL_ADDRESS}/g, order.shipperCompany?.legalAddress || 'Не указано')
      .replace('{CARRIER_NAME}', order.carrierId ? `Перевозчик ID: ${order.carrierId}` : '[Будет указано после назначения]')
      .replace('{CARRIER_INFO}', order.carrierId ? 'Данные перевозчика' : '[Данные перевозчика будут указаны после принятия заявки]')
      .replace('{CARGO_TYPE}', order.cargoType)
      .replace('{WEIGHT}', order.weight.toLocaleString('ru-RU'))
      .replace('{VOLUME}', order.volume.toLocaleString('ru-RU'))
      .replace('{TRANSPORT_MODE}', order.transportMode ? TRANSPORT_MODE_NAMES[order.transportMode] || order.transportMode : 'Стандартная перевозка')
      .replace('{ORIGIN_ADDRESS}', order.origin.address)
      .replace('{ORIGIN_CONTACT_NAME}', order.origin.contactName || 'Не указано')
      .replace('{ORIGIN_CONTACT_PHONE}', order.origin.contactPhone || 'Не указано')
      .replace('{DESTINATION_ADDRESS}', order.destination.address)
      .replace('{DESTINATION_CONTACT_NAME}', order.destination.contactName || 'Не указано')
      .replace('{DESTINATION_CONTACT_PHONE}', order.destination.contactPhone || 'Не указано')
      .replace('{REQUIRED_DATE}', new Date(order.requiredDate).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }))
      .replace('{DISTANCE}', order.distance?.toLocaleString('ru-RU') || 'Рассчитывается')
      .replace('{BASE_PRICE}', basePrice.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }))
      .replace('{VAT_AMOUNT}', vatAmount.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }))
      .replace('{PRICE_WITH_VAT}', priceWithVat.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }))
      .replace(/{INSURANCE}/g, (order.insurance || 0).toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }))
      .replace('{COMMISSION}', (order.aggregatorCommission || 0).toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }))
      .replace('{FINAL_PRICE}', finalPrice.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }))
      .replace('{PAYMENT_METHOD}', order.paymentMethod ? PAYMENT_METHOD_NAMES[order.paymentMethod] || order.paymentMethod : 'По согласованию')
      .replace('{SPECIAL_CONDITIONS}', 'Особые условия: Согласовываются дополнительно между сторонами.')
      .replace('{BANK_NAME}', order.shipperCompany?.bankName || 'Не указано')
      .replace('{BANK_ACCOUNT}', order.shipperCompany?.bankAccount || 'Не указано')
      .replace('{CORRESPONDENT_ACCOUNT}', order.shipperCompany?.bankCorrespondentAccount || '30101810400000000225')
      .replace('{BIC}', order.shipperCompany?.bankBic || '044525225')
      .replace('{ACTUAL_ADDRESS}', order.shipperCompany?.actualAddress || order.shipperCompany?.legalAddress || 'Не указано')
      .replace('{MANAGER_NAME}', order.shipperCompany?.managerName || 'Не указано')
      .replace('{PHONE}', order.shipperCompany?.phone || 'Не указано')
      .replace('{EMAIL}', order.shipperCompany?.email || 'Не указано')
      .replace('{DIRECTOR_NAME}', order.shipperCompany?.directorName || 'Не указано')
      .replace('{CARRIER_ADDRESS}', '[Будет указано после принятия заявки]')
      .replace('{CARRIER_ACTUAL_ADDRESS}', '[Будет указано]')
      .replace('{CARRIER_INN}', '[Будет указано]')
      .replace('{CARRIER_KPP}', '[Будет указано]')
      .replace('{CARRIER_OGRN}', '[Будет указано]')
      .replace('{CARRIER_BANK}', '[Будет указано]')
      .replace('{CARRIER_ACCOUNT}', '[Будет указано]')
      .replace('{CARRIER_CORR_ACCOUNT}', '[Будет указано]')
      .replace('{CARRIER_BIC}', '[Будет указано]')
      .replace('{CARRIER_MANAGER}', '[Будет указано]')
      .replace('{CARRIER_PHONE}', '[Будет указано]')
      .replace('{CARRIER_EMAIL}', '[Будет указано]')
      .replace('{CARRIER_DIRECTOR}', '[Будет указано]');

    return content;
  }, [document, order]);

  if (!document || !order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Документ не найден', headerShown: true }} />
        <View style={styles.errorContainer}>
          <FileText size={64} color={Colors.textLight} />
          <Text style={styles.errorText}>Документ не найден</Text>
        </View>
      </View>
    );
  }

  const handleDownload = async () => {
    try {
      if (Platform.OS === 'web') {
        window.open(document.url, '_blank');
      } else {
        const supported = await Linking.canOpenURL(document.url);
        if (supported) {
          await Linking.openURL(document.url);
        } else {
          Alert.alert('Ошибка', 'Не удалось открыть документ');
        }
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      Alert.alert('Ошибка', 'Не удалось скачать документ');
    }
  };

  const getDocumentTypeLabel = (type: typeof document.type) => {
    const labels: Record<typeof document.type, string> = {
      contract: 'Договор перевозки',
      upd: 'УПД',
      consignment_note: 'Товарная накладная (ТОРГ-12)',
      waybill: 'Транспортная накладная',
      invoice: 'Счет-фактура',
      cmr: 'CMR',
      edi: 'ЭДО',
      other: 'Другое',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'signed':
        return 'Подписан';
      case 'approved':
        return 'Согласовано';
      case 'rejected':
        return 'Отклонено';
      case 'draft':
        return 'Черновик';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'signed':
      case 'approved':
        return Colors.success;
      case 'rejected':
        return Colors.error;
      case 'draft':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: getDocumentTypeLabel(document.type),
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.surface,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      <View style={styles.documentHeader}>
        <View style={styles.headerInfo}>
          <Text style={styles.documentTitle}>{document.name}</Text>
          <Text style={styles.documentSubtitle}>Заказ #{order.id}</Text>
          <View style={styles.documentMeta}>
            <Text style={styles.metaText}>
              Загружен: {new Date(document.uploadedAt).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            {document.status && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(document.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(document.status)}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}
          activeOpacity={0.7}
        >
          <Download size={24} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {document.attachments && document.attachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <View style={styles.attachmentsHeader}>
              <Paperclip size={20} color={Colors.text} />
              <Text style={styles.attachmentsTitle}>Вложения</Text>
            </View>
            {document.attachments.map((attachment) => (
              <TouchableOpacity
                key={attachment.id}
                style={styles.attachmentCard}
                onPress={async () => {
                  try {
                    if (Platform.OS === 'web') {
                      window.open(attachment.url, '_blank');
                    } else {
                      const supported = await Linking.canOpenURL(attachment.url);
                      if (supported) {
                        await Linking.openURL(attachment.url);
                      } else {
                        Alert.alert('Ошибка', 'Не удалось открыть файл');
                      }
                    }
                  } catch (error) {
                    console.error('Error opening attachment:', error);
                    Alert.alert('Ошибка', 'Не удалось открыть файл');
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.attachmentIcon}>
                  <FileText size={24} color={Colors.accent} />
                </View>
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName}>{attachment.name}</Text>
                  <Text style={styles.attachmentMeta}>
                    {(attachment.size / 1024).toFixed(1)} KB • {new Date(attachment.uploadedAt).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
                <Download size={20} color={Colors.accent} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {document.type === 'contract' && contractContent && (
          <View style={styles.contractContainer}>
            <Text style={styles.contractText}>{contractContent}</Text>
          </View>
        )}

        {document.signatures && document.signatures.length > 0 && (
          <View style={styles.signaturesSection}>
            <View style={styles.signaturesSectionHeader}>
              <CheckCircle2 size={24} color={Colors.success} />
              <Text style={styles.signaturesSectionTitle}>Подписи</Text>
            </View>
            {document.signatures.map((signature) => (
              <View key={signature.id} style={styles.signatureCard}>
                <View style={styles.signatureHeader}>
                  <View style={styles.signatureInfo}>
                    <Text style={styles.signatureName}>{signature.signedBy}</Text>
                    <Text style={styles.signatureRole}>
                      {signature.signedByRole === 'shipper' ? 'Грузоотправитель' : 
                       signature.signedByRole === 'carrier' ? 'Перевозчик' : 'Водитель'}
                    </Text>
                    <Text style={styles.signatureDate}>
                      {new Date(signature.signedAt).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <CheckCircle2 size={32} color={Colors.success} />
                </View>
                {signature.signatureData && (
                  <View style={styles.signatureImageContainer}>
                    <Image
                      source={{ uri: signature.signatureData }}
                      style={styles.signatureImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {document.type === 'contract' && !hasUserSigned && (
          <TouchableOpacity
            style={styles.signButton}
            onPress={() => setShowSignaturePad(true)}
            activeOpacity={0.8}
          >
            <PenTool size={24} color={Colors.surface} />
            <Text style={styles.signButtonText}>Подписать документ</Text>
          </TouchableOpacity>
        )}

        {document.type === 'contract' && hasUserSigned && (
          <View style={styles.signedBadge}>
            <CheckCircle2 size={24} color={Colors.success} />
            <Text style={styles.signedBadgeText}>Вы подписали этот документ</Text>
          </View>
        )}

        {document.type !== 'contract' && (
          <View style={styles.previewContainer}>
            <FileText size={80} color={Colors.textLight} />
            <Text style={styles.previewTitle}>Предварительный просмотр недоступен</Text>
            <Text style={styles.previewSubtitle}>
              Нажмите кнопку загрузки, чтобы открыть документ
            </Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={handleDownload}
              activeOpacity={0.8}
            >
              <Text style={styles.openButtonText}>Открыть документ</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <SignaturePad
        visible={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onSave={handleSignDocument}
        title="Подписать документ"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginTop: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
    marginRight: 16,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  documentSubtitle: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  downloadButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  contractText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 20,
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      web: 'monospace',
    }),
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 20,
    textAlign: 'center',
  },
  previewSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  openButton: {
    marginTop: 24,
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.surface,
  },
  attachmentsSection: {
    marginBottom: 20,
  },
  attachmentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  attachmentsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attachmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  attachmentMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  contractContainer: {
    marginBottom: 20,
  },
  signaturesSection: {
    marginVertical: 20,
  },
  signaturesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  signaturesSectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  signatureCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.success + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signatureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  signatureInfo: {
    flex: 1,
  },
  signatureName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  signatureRole: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  signatureDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  signatureImageContainer: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  signatureImage: {
    width: '100%',
    height: '100%',
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.surface,
  },
  signedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.success + '20',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  signedBadgeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.success,
  },
});
