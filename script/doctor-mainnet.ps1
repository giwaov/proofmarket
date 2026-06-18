$ErrorActionPreference = "Stop"

$rpc = if ($env:ZG_RPC_URL) { $env:ZG_RPC_URL } else { "https://evmrpc.0g.ai" }
$indexer = if ($env:ZG_STORAGE_INDEXER) { $env:ZG_STORAGE_INDEXER } else { "https://indexer-storage-turbo.0g.ai" }
$compute = if ($env:ZG_COMPUTE_BASE_URL) { $env:ZG_COMPUTE_BASE_URL } else { "https://router-api.0g.ai/v1" }

Write-Host "ProofMarket 0G Mainnet doctor"

$payload = @{
    jsonrpc = "2.0"
    method = "eth_chainId"
    params = @()
    id = 1
} | ConvertTo-Json -Compress

$chainResponse = Invoke-RestMethod -Uri $rpc -Method Post -ContentType "application/json" -Body $payload
$chainId = [Convert]::ToInt64($chainResponse.result, 16)
if ($chainId -ne 16661) {
    throw "Wrong network: RPC returned chain ID $chainId, expected 16661."
}
Write-Host "[ok] RPC is 0G Mainnet (chain ID 16661)"

$blockPayload = @{
    jsonrpc = "2.0"
    method = "eth_blockNumber"
    params = @()
    id = 2
} | ConvertTo-Json -Compress
$blockResponse = Invoke-RestMethod -Uri $rpc -Method Post -ContentType "application/json" -Body $blockPayload
$block = [Convert]::ToInt64($blockResponse.result, 16)
Write-Host "[ok] Latest block: $block"

try {
    $null = Invoke-WebRequest -Uri $indexer -Method Head -TimeoutSec 15
    Write-Host "[ok] Storage Turbo indexer reachable"
} catch {
    Write-Host "[warn] Storage indexer did not accept HEAD; upload SDK may still work"
}

try {
    $modelsUrl = "$($compute.TrimEnd('/'))/models"
    $headers = @{}
    if ($env:ZG_COMPUTE_API_KEY) {
        $headers["Authorization"] = "Bearer $env:ZG_COMPUTE_API_KEY"
    }
    $null = Invoke-WebRequest -Uri $modelsUrl -Headers $headers -TimeoutSec 15
    Write-Host "[ok] 0G Compute Router reachable"
} catch {
    if ($env:ZG_COMPUTE_API_KEY) {
        Write-Host "[warn] Compute Router check failed with the configured API key"
    } else {
        Write-Host "[info] Compute API key not set; endpoint requires authenticated production access"
    }
}

if ($env:PROOFMARKET_CONTRACT_ADDRESS) {
    $codePayload = @{
        jsonrpc = "2.0"
        method = "eth_getCode"
        params = @($env:PROOFMARKET_CONTRACT_ADDRESS, "latest")
        id = 3
    } | ConvertTo-Json -Compress
    $codeResponse = Invoke-RestMethod -Uri $rpc -Method Post -ContentType "application/json" -Body $codePayload
    if ($codeResponse.result -eq "0x") {
        throw "No contract code found at $env:PROOFMARKET_CONTRACT_ADDRESS"
    }
    Write-Host "[ok] ProofMarket contract exists on 0G Mainnet"
} else {
    Write-Host "[info] PROOFMARKET_CONTRACT_ADDRESS not set"
}

Write-Host "Explorer: https://chainscan.0g.ai"
