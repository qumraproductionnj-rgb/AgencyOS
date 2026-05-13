Set-Location -LiteralPath "E:\V\apps\api"
$env:TS_NODE_TRANSPILE_ONLY = "false"
$env:TS_NODE_PROJECT = "tsconfig.json"
npx ts-node -r tsconfig-paths/register src/main.ts 2>&1 | Out-File -FilePath "E:\V\api-output.log" -Encoding utf8 -Force
