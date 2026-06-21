#!/bin/sh

CERT_DIR="nginx/certs"

if [ -z "$(ls -A "$CERT_DIR")" ]; then
    echo "Brak certyfikatów w folderze $CERT_DIR. Generowanie nowych..."
    
    # Generowanie samopodpisanego certyfikatu (ważnego 365 dni)
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_DIR/nginx-selfsigned.key" \
        -out "$CERT_DIR/nginx-selfsigned.crt" \
        -subj "/C=PL/ST=Mazowieckie/L=Warsaw/O=Dev/CN=localhost"
        
    echo "Certyfikaty zostały wygenerowane."
else
    echo "Znaleziono istniejące certyfikaty w folderze $CERT_DIR. Pomijam generowanie."
fi

echo "Budowanie obrazu dockera..."
docker build -t ai-detector-fe .

echo "Uruchamianie kontenera..."
docker run -d --name ai-detector-fe --rm -p 80:80 -p 443:443 -v "${PWD}/nginx/certs:/etc/nginx/certs" ai-detector-fe