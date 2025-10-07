<?php
use Bitrix\Main\ModuleManager;
use Bitrix\Main\IO\Directory;
use Bitrix\Iblock\IblockTable;

class events_calendar extends CModule
{
    var $MODULE_ID = "events.calendar";
    var $MODULE_VERSION = "1.0.0";
    var $MODULE_VERSION_DATE = "2025-10-05";
    var $MODULE_NAME = "Events Calendar";
    var $MODULE_DESCRIPTION = "Модуль для календаря событий.";
    var $PARTNER_NAME = "Платформа - Якутск";
    var $PARTNER_URI = "https://platforma.bz";

    function DoInstall()
    {
        ModuleManager::registerModule($this->MODULE_ID);
        $this->InstallFiles();
        $this->InstallDB();
        return true;
    }

    function DoUninstall()
    {
        $this->UnInstallDB();
        $this->UnInstallFiles();
        ModuleManager::unRegisterModule($this->MODULE_ID);
        return true;
    }

    function InstallFiles()
    {
        CopyDirFiles(
            __DIR__ . "/components/custom/",
            $_SERVER["DOCUMENT_ROOT"] . "/local/components/",
            true,
            true
        );

        return true;
    }

    function UnInstallFiles()
    {
        Directory::deleteDirectory($_SERVER["DOCUMENT_ROOT"] . "/local/components/events.calendar");
        return true;
    }

    function InstallDB()
    {
        if (!CModule::IncludeModule("iblock")) {
            ShowError("Модуль инфоблоков не установлен");
            return false;
        }

        $arIblocks = [
            [
                "CODE" => "events_calendar",
                "TYPE" => "content",
                "NAME" => "Календарь событий",
                "NAME_EN" => "Events Calendar",
                "SITE_ID" => "s1",
                "LANG" => [
                    "ru" => [
                        "NAME" => "Календарь событий",
                        "SECTION_NAME" => "Разделы",
                        "ELEMENT_NAME" => "События"
                    ],
                    "en" => [
                        "NAME" => "Events Calendar",
                        "SECTION_NAME" => "Sections",
                        "ELEMENT_NAME" => "Events"
                    ]
                ]
            ],
            [
                "CODE" => "events_calendar_en",
                "TYPE" => "content_en",
                "NAME" => "Events Calendar (EN)",
                "NAME_EN" => "Events Calendar (EN)",
                "SITE_ID" => "en",
                "LANG" => [
                    "en" => [
                        "NAME" => "Events Calendar",
                        "SECTION_NAME" => "Sections",
                        "ELEMENT_NAME" => "Events"
                    ]
                ]
            ]
        ];

        foreach ($arIblocks as $iblockConfig) {
            $iblockId = $this->createIblock($iblockConfig);

            if ($iblockConfig["CODE"] == "events_calendar" && $iblockId) {
                $this->AddTestData($iblockId);
            }
        }

        return true;
    }

    function createIblock($config)
    {
        $iblockDb = IblockTable::getList([
            "filter" => [
                "CODE" => $config["CODE"], 
                "IBLOCK_TYPE_ID" => $config["TYPE"]
            ]
        ])->fetch();

        if ($iblockDb) {
            $iblockId = $iblockDb["ID"];
        } else {
            $iblock = new CIBlock;
            $arFields = [
                "ACTIVE" => "Y",
                "NAME" => $config["NAME"],
                "CODE" => $config["CODE"],
                "IBLOCK_TYPE_ID" => $config["TYPE"],
                "SITE_ID" => [$config["SITE_ID"]],
                "SORT" => 500,
                "GROUP_ID" => ["2" => "R"],
                "VERSION" => 2,
                "LIST_MODE" => "C",
                "WORKFLOW" => "N",
                "BIZPROC" => "N",
                "INDEX_ELEMENT" => "N",
                "INDEX_SECTION" => "N",
            ];

            $iblockId = $iblock->Add($arFields);

            if (!$iblockId) {
                ShowError("Ошибка создания инфоблока {$config['NAME']}: " . $iblock->LAST_ERROR);
                return false;
            }

        }

        return $iblockId;
    }

    function AddTestData($iblockId)
    {
        $section = new CIBlockSection;
        $arSectionFields = [
            "ACTIVE" => "Y",
            "IBLOCK_ID" => $iblockId,
            "NAME" => "1957",
            "CODE" => "1957",
            "SORT" => 500,
        ];
        
        $sectionId = $section->Add($arSectionFields);
        
        if (!$sectionId) {
            ShowError("Ошибка создания раздела: " . $section->LAST_ERROR);
            return false;
        }

        $element = new CIBlockElement;
        $arElementFields = [
            "ACTIVE" => "Y",
            "IBLOCK_ID" => $iblockId,
            "IBLOCK_SECTION_ID" => $sectionId,
            "NAME" => "Создан трест «Якуталмаз»",
            "CODE" => "sozdan-trest-yakutalmaz-1957",
            "ACTIVE_FROM" => "06.10.1957",
            "PREVIEW_TEXT" => "В 1956 года совет министров СССР принял постановление о подготовке к промышленному освоению открытых месторождений алмазов в Якутии.",
            "PREVIEW_TEXT_TYPE" => "text",
        ];
        
        $elementId = $element->Add($arElementFields);
        
        if (!$elementId) {
            ShowError("Ошибка создания элемента: " . $element->LAST_ERROR);
            return false;
        }

        return true;
    }

    function UnInstallDB()
    {
        if (!CModule::IncludeModule("iblock")) {
            ShowError("Модуль инфоблоков не установлен");
            return false;
        }

        // Не удаляем ИБ

        return true;
    }
}
?>