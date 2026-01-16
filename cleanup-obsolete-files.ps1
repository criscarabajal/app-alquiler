# Script de Limpieza - Eliminar archivos obsoletos post-refactoring
# Ejecutar desde la raíz del proyecto: .\cleanup-obsolete-files.ps1

Write-Host "🗑️  Limpieza de Archivos Obsoletos" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "src\modules")) {
    Write-Host "❌ Error: No se encuentra la carpeta 'src\modules'." -ForegroundColor Red
    Write-Host "   Asegúrate de estar en la raíz del proyecto." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Directorio verificado correctamente" -ForegroundColor Green
Write-Host ""

# Lista de archivos/carpetas a eliminar
$itemsToDelete = @(
    @{ Path = "src\utils"; Type = "Carpeta"; Reason = "Migrado a modules/" }
    @{ Path = "src\services"; Type = "Carpeta"; Reason = "Migrado a modules/orders/" }
    @{ Path = "src\components"; Type = "Carpeta"; Reason = "Movido a modules/*/components/" }
    @{ Path = "src\pages"; Type = "Carpeta"; Reason = "Carpeta vacía" }
    @{ Path = "src\supabase.js"; Type = "Archivo"; Reason = "Migrado a modules/core/config/" }
)

Write-Host "📋 Archivos/carpetas a eliminar:" -ForegroundColor Yellow
Write-Host ""

foreach ($item in $itemsToDelete) {
    if (Test-Path $item.Path) {
        Write-Host "  ❌ $($item.Path)" -ForegroundColor Red
        Write-Host "     → $($item.Reason)" -ForegroundColor Gray
    } else {
        Write-Host "  ✓ $($item.Path) (ya eliminado)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "⚠️  ADVERTENCIA: Esta acción NO se puede deshacer" -ForegroundColor Yellow
Write-Host ""

# Pedir confirmación
$confirmation = Read-Host "¿Deseas continuar con la eliminación? (S/N)"

if ($confirmation -ne 'S' -and $confirmation -ne 's') {
    Write-Host ""
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Iniciando limpieza..." -ForegroundColor Cyan
Write-Host ""

$deletedCount = 0
$errorCount = 0

foreach ($item in $itemsToDelete) {
    if (Test-Path $item.Path) {
        try {
            Write-Host "  Eliminando: $($item.Path)..." -NoNewline
            
            if ($item.Type -eq "Carpeta") {
                Remove-Item -Recurse -Force $item.Path -ErrorAction Stop
            } else {
                Remove-Item -Force $item.Path -ErrorAction Stop
            }
            
            Write-Host " ✅" -ForegroundColor Green
            $deletedCount++
        }
        catch {
            Write-Host " ❌ Error" -ForegroundColor Red
            Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Limpieza completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "  • Elementos eliminados: $deletedCount" -ForegroundColor Green
Write-Host "  • Errores: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($errorCount -eq 0) {
    Write-Host "🎉 ¡Todo limpio! La aplicación ahora solo contiene código activo." -ForegroundColor Green
} else {
    Write-Host "⚠️  Algunos errores ocurrieron. Revisa los mensajes arriba." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Próximo paso: Ejecuta 'npm run dev' para verificar que todo funciona correctamente" -ForegroundColor Cyan
Write-Host ""
