$CertDir = "nginx\certs"

$CertFiles = Get-ChildItem -Path $CertDir

if ($CertFiles.Count -eq 0) {
    Write-Host "Brak certyfikatów w folderze $CertDir. Generowanie nowych..." -ForegroundColor Yellow
    
    # Generowanie samopodpisanego certyfikatu (ważnego 365 dni)
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout "$CertDir\nginx-selfsigned.key" `
        -out "$CertDir\nginx-selfsigned.crt" `
        -subj "/C=PL/ST=Mazowieckie/L=Warsaw/O=Dev/CN=localhost"
        
    Write-Host "Certyfikaty zostały wygenerowane." -ForegroundColor Green
} else {
    Write-Host "Znaleziono istniejące certyfikaty w folderze $CertDir. Pomijam generowanie." -ForegroundColor Green
}

Write-Host "Budowanie obrazu dockera..." -ForegroundColor Cyan
docker build -t ai-detector-fe .

Write-Host "Uruchamianie kontenera..." -ForegroundColor Cyan
docker run -d --name ai-detector-fe --rm -p 80:80 -p 443:443 -v "${PWD}\nginx\certs:/etc/nginx/certs" ai-detector-fe