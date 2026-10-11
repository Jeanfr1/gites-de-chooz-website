# Un QR, une entrée, quatre gîtes à terme

A proprietária quer um QR que abre o portal, de onde se escolhe o imóvel e sua plataforma de reserva. Como a URL final foi adiada, este pacote **não contém QR final**. Não substituímos o portal pelo Facebook ou pela ficha de um único gîte.

Depois de definir o endereço público:

```bash
python -m pip install -r requirements.txt
python generer_qr.py --url https://ENDERECO-REAL-DO-PORTAL
```

O gerador cria `final/qr-portail.png`, `final/qr-portail.svg` e `final/destination.txt`. Conserva margem branca de quatro módulos e correção de erro M. Não inserir logo sobre o código. Preferir URL curta e estável; redirecionamentos devem preservar o destino dos hóspedes.

O comando de teste foi executado com um link real de reserva e os arquivos ficaram apenas na área de testes; esse QR não é o QR do portal. Antes de imprimir o final, escanear em dois aparelhos, abrir o endereço, escolher cada gîte e verificar a plataforma correspondente.

Abra `cartao.html`, selecione o PNG do QR correto, informe a URL e imprima em A6. A impressão fica bloqueada enquanto imagem e URL não forem escolhidas. O SVG pode ser usado na produção gráfica final. Verificar legibilidade, contraste e destino após a impressão.
