<?if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
/** @var array $arParams */
/** @var array $arResult */
/** @global CMain $APPLICATION */
/** @global CUser $USER */
/** @global CDatabase $DB */
/** @var CBitrixComponentTemplate $this */
/** @var string $templateName */
/** @var string $templateFile */
/** @var string $templateFolder */
/** @var string $componentPath */
/** @var CBitrixComponent $component */
$this->setFrameMode(true);
?>

<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.19/index.global.min.js'></script>

<?php
$months = [
    1 => 'января',
    2 => 'февраля',
    3 => 'марта',
    4 => 'апреля',
    5 => 'мая',
    6 => 'июня',
    7 => 'июля',
    8 => 'августа',
    9 => 'сентября',
    10 => 'октября',
    11 => 'ноября',
    12 => 'декабря'
];

$sectionNames = [];
foreach ($arResult["ITEMS"] as $key => $arItem) {
    $sectionId = $arItem['IBLOCK_SECTION_ID'];
    if ($sectionId && !isset($sectionNames[$sectionId])) {
        $sectionRes = CIBlockSection::GetByID($sectionId);
        if ($section = $sectionRes->Fetch()) {
            $sectionNames[$sectionId] = $section['NAME'];
        }
    }
    if ($sectionId && isset($sectionNames[$sectionId])) {
        $arResult["ITEMS"][$key]['CUSTOM_YEAR'] = $sectionNames[$sectionId];
    }
}

$years = [];
foreach ($arResult["ITEMS"] as $arItem) {
    $sectionId = $arItem['IBLOCK_SECTION_ID'];
    if ($sectionId && isset($sectionNames[$sectionId])) {
        $years[] = $sectionNames[$sectionId];
        
    }
}
$years = array_unique($years);
$years[] = date('Y');
// $years[] = 'Все года';
$years = array_unique($years);
rsort($years);

$todayDay = date('d');
$todayMonth = date('m');
?>

<script>
<?php
    usort($arResult["ITEMS"], function($a, $b) use ($sectionNames) {
    $yearA = isset($sectionNames[$a['IBLOCK_SECTION_ID']]) ? (int)$sectionNames[$a['IBLOCK_SECTION_ID']] : 0;
    $yearB = isset($sectionNames[$b['IBLOCK_SECTION_ID']]) ? (int)$sectionNames[$b['IBLOCK_SECTION_ID']] : 0;
    return $yearB <=> $yearA;
    });
?>
window.calendarEvents = [
<?foreach($arResult["ITEMS"] as $arItem):?>
    <?php
        $sectionId = $arItem['IBLOCK_SECTION_ID'];
        $year = isset($sectionNames[$sectionId]) ? $sectionNames[$sectionId] : '';
        // $date = $arItem['PROPERTIES']['DAY']['VALUE'];
        $date = $arItem['ACTIVE_FROM'];
        if ($year) {
            $dateFormatted = $year . '-' . date('m-d', strtotime(str_replace('.', '-', $date)));
            $title = '<b style="
    font-size: 16px;
    font-weight: 800;
">' .$year . "</b>" . "\n" . $arItem['NAME'];
            // $title = $year . "\n" . $arItem['NAME'];
        } else {
            $title = $arItem['NAME'];
        }

    ?>
    {
        id: <?=json_encode($arItem['ID'])?>,
        title: <?=json_encode($title)?>,
        start: <?=json_encode($dateFormatted)?>,
        description: <?=json_encode(htmlspecialchars_decode($arItem['PREVIEW_TEXT']))?>,
        image: <?=json_encode(CFile::GetPath($arItem['PREVIEW_PICTURE']))?>,
        year: <?=json_encode(value: $year)?>
    },
<?endforeach;?>
];
</script>

<div class="l-calendar">
    <div class="l-calendar__top">
        <div class="l-calendar__today">
            <span>В этот день /</span>
            <span class="l-calendar__today-highlight">
                <?=date('j') . ' ' . $months[(int)date('n')]?>
            </span>
        </div>
        <div class="l-calendar__cards">
            
            <?foreach($arResult["ITEMS"] as $arItem):?>
                <?
                $this->AddEditAction($arItem['ID'], $arItem['EDIT_LINK'], CIBlock::GetArrayByID($arItem["IBLOCK_ID"], "ELEMENT_EDIT"));
                $this->AddDeleteAction($arItem['ID'], $arItem['DELETE_LINK'], CIBlock::GetArrayByID($arItem["IBLOCK_ID"], "ELEMENT_DELETE"), array("CONFIRM" => GetMessage('CT_BNL_ELEMENT_DELETE_CONFIRM')));
                ?>

                <?php
                    // $dateValue = $arItem['PROPERTIES']['DAY']['VALUE'];
                    $dateValue = $arItem['ACTIVE_FROM'];
                    $showCard = false;
                    if (preg_match('/(\d{2})\.(\d{2})\.(\d{4})/', $dateValue, $matches)) {
                        $cardDay = $matches[1];
                        $cardMonth = $matches[2];
                        if ($cardDay == $todayDay && $cardMonth == $todayMonth) {
                            $showCard = true;
                        }
                    }
                    $sectionId = $arItem['IBLOCK_SECTION_ID'];
                    $year = isset($sectionNames[$sectionId]) ? $sectionNames[$sectionId] : '';
                ?>

                <?if($showCard):?>
                    <div class="l-calendar__card <?=$arItem['PREVIEW_PICTURE'] ? '' : '__empty_img';?>" 
                        id="<?=$this->GetEditAreaId($arItem['ID']);?>"
                        data-id="<?=$arItem['ID']?>"
                    >
                        <a href="#card">
                            <? if ($arItem['PREVIEW_PICTURE']): ?>
                                <div class="l-calendar__card-img">
                                    <img src="<?=CFile::GetPath($arItem['PREVIEW_PICTURE'])?>" alt="<?=$arItem['NAME']?>">
                                </div>
                            <? endif; ?>
                            <div class="l-calendar__card-body">
                                <div class="l-calendar__card-year">
                                    <span><?=$arItem['CUSTOM_YEAR']?></span>
                                </div>
                                <div class="l-calendar__card-bottom">
                                    <div class="l-calendar__card-separator"></div>
                                    <div class="l-calendar__card-title">
                                        <span><?=$arItem['NAME']?></span>
                                    </div>
                                    <div class="l-calendar__card-day" style="display: none;">
                                        <span>
                                            <?php
                                            // $dateValue = $arItem['PROPERTIES']['DAY']['VALUE'];
                                            $dateValue = $arItem['ACTIVE_FROM'];
                                            $day = '';
                                            $monthNum = '';
                                            if (preg_match('/(\d{2})\.(\d{2})\.(\d{4})/', $dateValue, $matches)) {
                                                $day = ltrim($matches[1], '0');
                                                $monthNum = (int)$matches[2];
                                            }
                                            echo $day . ' ' . $months[$monthNum];
                                            ?>
                                        </span>
                                    </div>
                                    <div class="l-calendar__card-text" style="display: none;">
                                        <span><?=$arItem['PREVIEW_TEXT']?></span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                <?endif;?>
            <?endforeach;?>
            
        </div>
    </div>
    <div class="l-calendar__main">
        <div class="l-calendar__header">
            <div class="l-calendar__header-left">
                <div class="l-calendar__header-year">
                    <span id="calendar-header-title">Октябрь 2025</span>
                </div>
                <div class="l-calendar__header-arrows">
                    <a href="javascript:void(0);" class="l-calendar__arrow-prev">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.2198 20.61L6.58984 11.98L15.1798 3.39001L16.6398 4.85001L9.49984 11.98L16.6798 19.15L15.2198 20.61Z" fill="#212529"/>
                        </svg>
                    </a>
                    <a href="javascript:void(0);" class="l-calendar__arrow-next">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.81982 20.61L6.36982 19.15L13.4998 12.02L6.31982 4.85001L7.77982 3.39001L16.4098 12.02L7.81982 20.61Z" fill="#212529"/>
                        </svg>
                    </a>
                </div>
            </div>
            <div class="l-calendar__header-filter">
                <div class="l-calendar__filter-month">
                    <select name="month" id="month">
                        <option value="1">Январь</option>
                        <option value="2">Февраль</option>
                        <option value="3">Март</option>
                        <option value="4">Апрель</option>
                        <option value="5">Май</option>
                        <option value="6">Июнь</option>
                        <option value="7">Июль</option>
                        <option value="8">Август</option>
                        <option value="9">Сентябрь</option>
                        <option value="10" selected>Октябрь</option>
                        <option value="11">Ноябрь</option>
                        <option value="12">Декабрь</option>
                    </select>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.01973 11.9001L1.96973 5.85008L2.98973 4.83008L8.01973 9.86008L13.0097 4.87008L14.0297 5.88008L8.01973 11.9001Z" fill="#212529"/>
                    </svg>
                </div>
                <div class="l-calendar__filter-year" style="display: none">
                    <select name="year" id="year">
                        <?php foreach ($years as $year): ?>
                            <option value="<?=$year?>"<?=($year == date('Y') ? ' selected' : '')?>><?=$year?></option>
                        <?php endforeach; ?>
                    </select>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.01973 11.9001L1.96973 5.85008L2.98973 4.83008L8.01973 9.86008L13.0097 4.87008L14.0297 5.88008L8.01973 11.9001Z" fill="#212529"/>
                    </svg>
                </div>
            </div>
        </div>
        <div class="l-calendar__body">
            <div id='calendar'></div>
        </div>
    </div>
</div>
            

<div class="l-calendar__modal" id="calendarModal" style="display:none;">
    <div class="l-calendar__overlay"></div>

    <div class="l-calendar__modal-content">
        <div class="l-calendar__modal-left">
            <div class="l-calendar__modal-img">
                <img src="" alt="">
            </div>
        </div>
        <div class="l-calendar__modal-right">
            <div class="l-calendar__right-top">
                <button class="l-calendar__modal-close" id="calendarModalClose">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M27.8132 6.11998L25.8799 4.18665L15.9999 14.0533L6.11986 4.18665L4.18652 6.11998L14.0532 16L4.18652 25.88L6.11986 27.8133L15.9999 17.9466L25.8799 27.8133L27.8132 25.88L17.9465 16L27.8132 6.11998Z" fill="#212529"/>
                    </svg>
                </button>
            </div>
            <div class="l-calendar__right-body">
                <div class="l-calendar__modal-slider">
                    <div class="l-calendar__modal-slide">
                        <div class="l-calendar__modal-slide-year">1949 год</div>
                        <div class="l-calendar__modal-slide-date">6 Января</div>
                        <div class="l-calendar__modal-slide-text">Найден первый алмаз в Якутии</div>
                    </div>
                </div>
            </div>
            <div class="l-calendar__right-bottom">
                <div class="l-calendar__modal-controls">
                    <button class="l-calendar__modal-prev">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.2198 20.61L6.58984 11.98L15.1798 3.39001L16.6398 4.85001L9.49984 11.98L16.6798 19.15L15.2198 20.61Z" fill="#212529"/>
                        </svg>
                        <span>
                            1949
                        </span>
                    </button>
                    <div class="l-calendar__modal-dots"></div>
                    
                    <button class="l-calendar__modal-next">
                        <span>
                            1961
                        </span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.81982 20.61L6.36982 19.15L13.4998 12.02L6.31982 4.85001L7.77982 3.39001L16.4098 12.02L7.81982 20.61Z" fill="#212529"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>