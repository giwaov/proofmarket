$ErrorActionPreference = "Stop"

$rpc = if ($env:ZG_RPC_URL) { $env:ZG_RPC_URL } else { "https://evmrpc.0g.ai" }
$key = $env:PROOFMARKET_DEPLOYER_PRIVATE_KEY
if (-not $key) {
    throw "Set PROOFMARKET_DEPLOYER_PRIVATE_KEY to a funded 0G Mainnet wallet."
}

$forgeCommand = Get-Command forge -ErrorAction SilentlyContinue
if ($forgeCommand) {
    $forge = $forgeCommand.Source
} elseif (Test-Path "$env:USERPROFILE\.cargo\bin\forge.exe") {
    $forge = "$env:USERPROFILE\.cargo\bin\forge.exe"
} elseif (Test-Path "$env:USERPROFILE\.foundry\bin\forge.exe") {
    $forge = "$env:USERPROFILE\.foundry\bin\forge.exe"
} else {
    throw "forge.exe was not found. Install Foundry or add forge to PATH."
}

$chainPayload = @{
    jsonrpc = "2.0"
    method = "eth_chainId"
    params = @()
    id = 1
} | ConvertTo-Json -Compress
$chainResponse = Invoke-RestMethod -Uri $rpc -Method Post -ContentType "application/json" -Body $chainPayload
$chainId = [Convert]::ToInt64($chainResponse.result, 16)
if ($chainId -ne 16661) {
    throw "Refusing deployment: RPC chain ID is $chainId, expected 16661."
}

Write-Host "Network verified: 0G Mainnet (chain ID 16661)"
Write-Host "Deploying ProofMarketRegistry with $forge"
& $forge create contracts/ProofMarketRegistry.sol:ProofMarketRegistry `
    --rpc-url $rpc `
    --private-key $key `
    --broadcast

if ($LASTEXITCODE -ne 0) {
    throw "Deployment failed. Confirm the wallet is funded with 0G and retry."
}

Write-Host "After deployment, set PROOFMARKET_CONTRACT_ADDRESS and run script/doctor-mainnet.ps1."
