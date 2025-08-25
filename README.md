![INFOSTART.RU](https://infostart.ru/bitrix/templates/sandbox_empty/assets/tpl/abo/img/logo.svg)
Описание публикации на [INFOSTART.RU](https://infostart.ru/1c/tools/2458900/)

**## MCP 1C Modules Server (stdio)**

Минимальный MCP‑сервер, который отдаёт тексты модулей 1С из каталога выгрузки.

### Требования
- Node.js >= 18
- Каталог выгрузки конфигурации 1С (через `DESIGNER /DumpConfigToFiles`)

### Установка
```bash
npm install
```

### Запуск
1. Установите переменную окружения `MODULES_DIR` на путь к каталогу с файлами модулей (bsl/txt/1c):
   - PowerShell:
     ```powershell
     $env:MODULES_DIR = "C:\\path\\to\\1c_dump"
     ```
   - WSL/Linux:
     ```bash
     export MODULES_DIR=/mnt/c/path/to/1c_dump
     ```
2. Запустите сервер:
   ```bash
   npm start
   ```

### Подключение в Cursor (`~/.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "1c-modules-stdio": {
      "command": "node",
      "args": ["server.js"],
      "env": { "MODULES_DIR": "C:/path/to/1c_dump" }
    }
  }
}
```

### Инструменты
- `list_module_files({ pattern? })` — список файлов по glob‑шаблону (`**/*.{bsl,txt,1c,os,md}`)
- `read_module_text({ file, maxBytes? })` — чтение файла по относительному пути
- `grep_modules({ query, glob? })` — поиск в модулях (регэксп, нечувств. к регистру)

### Примечания
- Доступ ограничен каталогом `MODULES_DIR`.
- Рекомендуется регулярно обновлять выгрузку конфигурации.


