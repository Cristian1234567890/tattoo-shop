# Tattoo Shop V2 - E2E Test Suite Runner (PowerShell)
param (
    [string]$Url = "http://localhost:8080",
    [string]$Tier = "",
    [switch]$DomOnly,
    [switch]$BuildOnly,
    [switch]$Json,
    [switch]$Verbose
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

$cmdArgs = @("--experimental-strip-types", "--no-warnings", "run_tests.ts")

if ($Url -ne "http://localhost:8080") {
    $cmdArgs += @("--url", $Url)
}

if ($Tier -ne "") {
    $cmdArgs += @("--tier", $Tier)
}

if ($DomOnly) {
    $cmdArgs += "--dom-only"
}

if ($BuildOnly) {
    $cmdArgs += "--build-only"
}

if ($Json) {
    $cmdArgs += "--json"
}

if ($Verbose) {
    $cmdArgs += "--verbose"
}

& node $cmdArgs
exit $LASTEXITCODE
