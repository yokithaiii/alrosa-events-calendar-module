# Модуль Events Calendar 

## Установка

1. Создайте пустую папку "events.calendar" в /local/modules/

2. Распакуйте архив в созданную папку. Путь должен быть таким: /local/modules/events.calendar/

3. Установите модуль с раздела: Marketplace - Установленные решения - Events Calendar - Установить

4. Модуль создаст новый инфоблок "Календарь Событий" в Тип Инфоблока "Контент"

5. Модуль создаст новый компонент по пути: /local/components/events.calendar - шаблон .default

6. Далее создаем раздел где будет отображаться Календарь. Например в раздел СМИ. Пример на тесте: /press-center/events-calendar/

7. На страницу добавляем наш компонент: (Тип Инфоблока и сам ID Инфоблока возможно придется изменить)

```
<section class="ar-section">
    <div class="ar-section__container _g-outer-width _g-inner-padding">
        <div class="ar-section__content">
            <?$APPLICATION->IncludeComponent(
                "events.calendar",
                "",
                Array(
                    "IBLOCK_ID" => "326", // На ваш ID инфоблока "Календарь Событий"
                    "IBLOCK_TYPE" => "content",
                    "NEWS_COUNT" => "25"
                )
            );?>
        </div>
    </div>
</section>
```