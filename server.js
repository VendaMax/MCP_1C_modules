import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { globby } from "globby";

const modulesDir = process.env.MODULES_DIR || path.resolve("./modules");

const mcpServer = new McpServer({
	name: "mcp-1c-modules-server",
	version: "0.1.0",
});

// list_module_files
mcpServer.registerTool(
	"list_module_files",
	{
		description: "Список файлов модулей в каталоге выгрузки",
		inputSchema: {
			pattern: z.string().describe("glob-шаблон").optional(),
		},
	},
	async ({ pattern }) => {
		const globPattern = pattern || "**/*.{bsl,txt,1c,os,md}";
		const files = await globby(globPattern, { cwd: modulesDir, dot: false });
		return {
			content: [
				{ type: "text", text: JSON.stringify({ files }, null, 2) },
			],
		};
	}
);

// read_module_text
mcpServer.registerTool(
	"read_module_text",
	{
		description: "Чтение текста модуля по относительному пути",
		inputSchema: {
			file: z.string().describe("относительный путь в MODULES_DIR"),
			maxBytes: z.number().int().positive().optional(),
		},
	},
	async ({ file, maxBytes }) => {
		const filePath = path.resolve(modulesDir, file);
		const base = path.resolve(modulesDir);
		if (!filePath.startsWith(base)) throw new Error("Access denied");
		let data = await fs.readFile(filePath);
		if (maxBytes && data.length > maxBytes) data = data.subarray(0, maxBytes);
		return {
			content: [
				{ type: "text", text: data.toString("utf8") },
			],
		};
	}
);

// grep_modules
mcpServer.registerTool(
	"grep_modules",
	{
		description: "Поиск строки/регэкспа в модулях",
		inputSchema: {
			query: z.string().describe("строка или регэксп без разделителей"),
			glob: z.string().optional().describe("glob-шаблон, по умолчанию **/*.bsl"),
		},
	},
	async ({ query, glob }) => {
		const globPattern = glob || "**/*.bsl";
		const files = await globby(globPattern, { cwd: modulesDir });
		const results = [];
		const regex = new RegExp(query, "i");
		for (const rel of files) {
			const abs = path.resolve(modulesDir, rel);
			const content = await fs.readFile(abs, "utf8");
			const lines = content.split(/\r?\n/);
			lines.forEach((line, idx) => {
				if (regex.test(line)) results.push({ file: rel, line: idx + 1, text: line });
			});
		}
		return {
			content: [
				{ type: "text", text: JSON.stringify({ results }, null, 2) },
			],
		};
	}
);

const transport = new StdioServerTransport();
await mcpServer.connect(transport);


