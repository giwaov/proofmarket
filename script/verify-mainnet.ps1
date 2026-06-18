$ErrorActionPreference = "Stop"

$address = $env:PROOFMARKET_CONTRACT_ADDRESS
if (-not $address) {
    throw "Set PROOFMARKET_CONTRACT_ADDRESS first."
}

$rpc = if ($env:ZG_RPC_URL) { $env:ZG_RPC_URL } else { "https://evmrpc.0g.ai" }
$chainPayload = @{
    jsonrpc = "2.0"
    method = "eth_chainId"
    params = @()
    id = 1
} | ConvertTo-Json -Compress
$chainResponse = Invoke-RestMethod -Uri $rpc -Method Post -ContentType "application/json" -Body $chainPayload
$chainId = [Convert]::ToInt64($chainResponse.result, 16)
if ($chainId -ne 16661) {
    throw "Wrong network: expected 0G Mainnet chain ID 16661."
}

$codePayload = @{
    jsonrpc = "2.0"
    method = "eth_getCode"
    params = @($address, "latest")
    id = 2
} | ConvertTo-Json -Compress
$codeResponse = Invoke-RestMethod -Uri $rpc -Method Post -ContentType "application/json" -Body $codePayload
$code = $codeResponse.result
if ($code -eq "0x") {
    throw "No deployed bytecode at $address."
}

Write-Host "[ok] Runtime bytecode exists at $address"
Write-Host "Contract page: https://chainscan.0g.ai/address/$address"
Write-Host "Use Chainscan's Verify & Publish flow with:"
Write-Host "  Compiler: 0.8.24"
Write-Host "  Optimization: enabled, 200 runs"
Write-Host "  EVM version: Cancun"
Write-Host "  Source: contracts/ProofMarketRegistry.sol"
