# Change Log
All notable changes to this project will be documented in this file.
## [1.0.6] - 2021-08-06
### Updated
- 取消 data 封包拆分機制
### Fixed
- 修正斷線重連時產生多餘連線問題

## [1.0.5] - 2021-03-08
### Updated
- 依據 reconnectInterval 變數設定 DCCS reconnect 頻率
- 增加憑證自動信任環境變數
### Fixed
- 修正當使用 DCCS 連線以及 autoReconnect 為 false 時, 呼叫 disconnect() 後仍會自動重連的問題

## [1.0.4] - 2020-11-25
### Updated
- 將fraction point轉換移除
- 將config.json & recover.db 加上nodeId prefix
- 將dataRecover獨立成一個物件，包含創建db物件db path

## [1.0.3] - 2020-05-18
### Added
- open vpn for linux
- update, delete and delsert功能
### Updated
- 將scada相關字改為node

## [1.0.2] - 2020-03-05
### Added
- sendData 針對 tag value 增加 type 檢查機制
- 使用 fractionDisplayFormat 參數過濾小數點後面位數
- 將呼叫 uploadConfig 後的 config 記錄下來, 作為 sendData 時檢查的依據
### Updated
- rename project
- Upgrade node module

## [1.0.1] - 2020-01-21
### Added
- Add property "RetentionPolicyName" of DeviceConfig, it will auto bind Retention Policy to your device on cloud.

## [1.0.0] - 2020-01-06
### Added
- First version
