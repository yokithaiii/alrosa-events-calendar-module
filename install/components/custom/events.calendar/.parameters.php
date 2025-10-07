<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();

use Bitrix\Main\Loader;

if (!Loader::includeModule("iblock")) {
    return [];
}

$iblockTypes = [];
$dbTypes = CIBlockType::GetList(["SORT" => "ASC"]);
while ($type = $dbTypes->Fetch()) {
    $iblockTypes[$type["ID"]] = $type["ID"];
}

$iblockList = [];
$dbIblocks = CIBlock::GetList(["SORT" => "ASC"], ["TYPE" => ($arCurrentValues["IBLOCK_TYPE"] ?? "content")]);
while ($iblock = $dbIblocks->Fetch()) {
    $iblockList[$iblock["ID"]] = $iblock["NAME"];
}

$arComponentParameters = [
    "GROUPS" => [
        "SETTINGS" => [
            "NAME" => "Настройки инфоблока",
            "SORT" => 100,
        ],
    ],
    "PARAMETERS" => [
        "IBLOCK_TYPE" => [
            "PARENT" => "SETTINGS",
            "NAME" => "Тип инфоблока",
            "TYPE" => "LIST",
            "VALUES" => $iblockTypes,
            "DEFAULT" => "foo_banners",
            "REFRESH" => "Y",
        ],
        "IBLOCK_ID" => [
            "PARENT" => "SETTINGS",
            "NAME" => "Инфоблок",
            "TYPE" => "LIST",
            "VALUES" => $iblockList,
            "DEFAULT" => "",
            "REFRESH" => "Y",
        ],
        "NEWS_COUNT" => [
            "PARENT" => "SETTINGS",
            "NAME" => "Кол-во событий",
            "TYPE" => "STRING",
            "DEFAULT" => "20",
        ]
    ],
];
?>