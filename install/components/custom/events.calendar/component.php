<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();

use Bitrix\Main\Loader;

if (!Loader::includeModule("iblock")) {
    ShowError("Модуль инфоблоков не установлен");
    return;
}

$arParams["IBLOCK_TYPE"] = trim($arParams["IBLOCK_TYPE"] ?? "content");
$arParams["IBLOCK_ID"] = intval($arParams["IBLOCK_ID"] ?? 0);
$arParams["NEWS_COUNT"] = intval($arParams["NEWS_COUNT"] ?? 100);

if (!$arParams["IBLOCK_ID"]) {
    $iblock = CIBlock::GetList([], ["CODE" => ["events_calendar", "events_calendar_en"], "TYPE" => $arParams["IBLOCK_TYPE"]])->Fetch();
    if ($iblock) {
        $arParams["IBLOCK_ID"] = $iblock["ID"];
    }
}

if ($arParams["IBLOCK_ID"]) {
    $arFilter = [
        "IBLOCK_ID" => $arParams["IBLOCK_ID"],
        "ACTIVE" => "Y",
    ];
    
    $arSelect = [
        "ID",
        "IBLOCK_ID",
        "IBLOCK_SECTION_ID",
        "ACTIVE_FROM",
        "NAME",
        "PREVIEW_PICTURE",
        "PREVIEW_TEXT",
    ];

    $res = CIBlockElement::GetList(
        ["ACTIVE_FROM" => "DESC", "SORT" => "ASC"],
        $arFilter,
        false,
        ["nTopCount" => $arParams["NEWS_COUNT"]],
        $arSelect
    );
    
    while ($ob = $res->GetNextElement()) {
        $arFields = $ob->GetFields();
        $arProps = $ob->GetProperties();
        $arItem = array_merge($arFields, ["PROPERTIES" => $arProps]);
        $arResult["ITEMS"][] = $arItem;
    }

} else {
    ShowError("Инфоблок не найден");
}

$this->IncludeComponentTemplate();
?>