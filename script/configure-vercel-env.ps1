$ErrorActionPreference = "Stop"

$requiredSecrets = @(
    "ZG_COMPUTE_API_KEY",
    "ZG_STORAGE_PRIVATE_KEY",
    "PROOFMARKET_ISSUER_PRIVATE_KEY"
)

foreach ($name in $requiredSecrets) {
    $value = [Environment]::GetEnvironmentVariable($name)
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "$name is not loaded in this PowerShell session."
    }
}

function Set-VercelSecret {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value
    )

    $Value | vercel env add $Name production --sensitive --force --yes
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to configure $Name in Vercel."
    }
}

function Set-VercelValue {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value
    )

    vercel env add $Name production --value $Value --force --yes
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to configure $Name in Vercel."
    }
}

Write-Host "Configuring sensitive production variables..."
Set-VercelSecret "ZG_COMPUTE_API_KEY" $env:ZG_COMPUTE_API_KEY
Set-VercelSecret "ZG_STORAGE_PRIVATE_KEY" $env:ZG_STORAGE_PRIVATE_KEY
Set-VercelSecret "PROOFMARKET_ISSUER_PRIVATE_KEY" $env:PROOFMARKET_ISSUER_PRIVATE_KEY

Write-Host "Configuring public production settings..."
if ($env:VITE_WALLETCONNECT_PROJECT_ID) {
    Set-VercelValue "VITE_WALLETCONNECT_PROJECT_ID" $env:VITE_WALLETCONNECT_PROJECT_ID
} else {
    Write-Host "[warn] VITE_WALLETCONNECT_PROJECT_ID is not loaded; injected wallets work, but QR/mobile WalletConnect requires it."
}
Set-VercelValue "ZG_COMPUTE_BASE_URL" "https://router-api.0g.ai/v1"
Set-VercelValue "ZG_COMPUTE_MODEL" "zai-org/GLM-5-FP8"
Set-VercelValue "ZG_CHAIN_ID" "16661"
Set-VercelValue "ZG_RPC_URL" "https://evmrpc.0g.ai"
Set-VercelValue "ZG_STORAGE_INDEXER" "https://indexer-storage-turbo.0g.ai"
Set-VercelValue "PROOFMARKET_CONTRACT_ADDRESS" "0xdEd45520Ea0f3740d6e5f76363d245342d290287"
Set-VercelValue "ALLOW_DEMO_MODE" "false"

Write-Host "Redeploying ProofMarket production..."
vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    throw "Vercel redeployment failed."
}

Write-Host "[ok] ProofMarket production environment configured."
