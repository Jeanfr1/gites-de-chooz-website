# Handoff do portal

## Arquivos canônicos

`dados.json` reúne identidade, dois gîtes ativos, dois lugares futuros desativados, passeios e So Zen. `proveniencia-fotos.json` identifica os JPEGs originais. `CONTEUDO-FR.md` é o roteiro editorial; `timeline.json` documenta a animação.

O estudo é uma versão estática autocontida: o HTML contém as duas fichas atuais, e `portal.js` inclui uma cópia dos dados para funcionar sem servidor. Alterar somente o JSON externo **não atualiza automaticamente** o estudo. Na implementação final, usar esses dados no renderizador escolhido. Quando os outros gîtes forem conhecidos, gerar suas fichas, galerias, guias e rotas a partir dos registros reais; não basta trocar `active` no arquivo externo.

## Rotas do estudo

- `#accueil`: início e apresentação.
- `#gites`: comparação dos imóveis atuais.
- `#grain` e `#brasserie`: fichas e galerias.
- `#sejour-grain` e `#sejour-brasserie`: guia correto por imóvel.
- `#explorer`: passeios filtráveis.
- `#sozen`: universo So Zen e contato.

## Passagem para produção

1. Validar nome e instruções com a proprietária.
2. Usar fotos originais das fichas; maquete apenas como ilustração de marca.
3. Integrar texto vivo, rotas e dados reais ao projeto do site.
4. Gerar formatos e tamanhos responsivos para web sem substituir os masters do kit. Priorizar primeira imagem; carregar galeria sob demanda.
5. Rever no navegador os recortes e a abertura das camadas em desktop/mobile; revisar reduced motion, foco, dialog e impressão.
6. Definir o endereço público, publicar no fluxo escolhido e testar cada link de reserva.
7. Gerar o QR para esse endereço, testar leitura e aplicar ao cartão.

A maquete é uma imagem ilustrativa em camadas; não usar seu traçado como mapa de chegada. As fotos reais e o endereço informado pelo anfitrião são a referência prática.


## Kit complet V3 : intégration So Zen

Consulter `../06-roteiros/SO-ZEN.md`. Utiliser uniquement `../01-identidade/so-zen-logo-transparente.png` et les deux sources yoga de `../05-secoes/so-zen/`. `dados.json` et la copie incluse dans `portal.js` indiquent la même identité et les mêmes photos. Les instructions actuelles sont réunies dans `PROMPTS.md`. `INDEX-DU-KIT.md` à la racine liste tous les livrables. Les contenus visibles du site sont entièrement en français.
