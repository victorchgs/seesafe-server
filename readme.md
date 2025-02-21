# SeeSafe-Server

## 📌 Introdução

De acordo com o IBGE, em 2023, o Brasil contava com mais de 6 milhões de pessoas com deficiência visual, sendo aproximadamente 500 mil delas cegas. Para se locomover, essas pessoas geralmente utilizam recursos como cães-guia ou bengalas. Embora eficientes, essas alternativas apresentam limitações, como o alto custo dos cães-guia e a incapacidade das bengalas de detectar obstáculos elevados. 

Nos últimos anos, surgiram soluções tecnológicas que oferecem suporte mais avançado, mas seu custo elevado ainda representa uma barreira para ampla adoção. Diante disso, propomos desenvolver um sistema de baixo custo que utiliza a câmera do celular para emitir alertas de áudio ou vibração sobre obstáculos no caminho e ao redor, democratizando o acesso a soluções tecnológicas e contribuindo para uma maior autonomia das pessoas com deficiência visual.

## 📱 Descrição da Aplicação

O aplicativo utiliza visão computacional para processar imagens capturadas pela câmera do celular e identificar obstáculos no caminho do usuário. Além disso, descreve o ambiente ao redor em tempo real por meio de mensagens de áudio ou vibração.

### 🔹 Funcionalidades Principais
- Identificação de obstáculos;
- Notificação de perigos no caminho;
- Interface simples e acessível para pessoas com deficiência visual;
- Possibilidade de envio de informações a um responsável.

## 🎯 Público-Alvo

O SeeSafe é destinado a pessoas com deficiência visual parcial ou total que buscam uma ferramenta acessível e eficiente para auxiliar na locomoção diária, especialmente em áreas urbanas. Além disso, o aplicativo também atende responsáveis ou cuidadores dessas pessoas, que poderão monitorar informações importantes, como a localização do usuário principal e receber avisos de emergência.

---

## 📂 Organização do Repositório

Este repositório está organizado da seguinte forma:

```
SEESAFE-SERVER/
│── data-analysis/       # Análises de dados de giroscópio e acelerômetro, além do treinamento e testes de modelos de predição de queda.
│── documentation/       # Documentação detalhada sobre a implementação do projeto.
│── server/              # Código-fonte do servidor, incluindo o microserviço de visão computacional.
│── readme.md            # Este arquivo.
```

## 🚀 Como Rodar o Servidor

Para executar o servidor do SeeSafe, siga os passos abaixo:

### 1️⃣ Criar e ativar um ambiente virtual (Python)
```bash
python -m venv venv
source venv/bin/activate  # No Linux/macOS
venv\Scripts\activate     # No Windows
```

### 2️⃣ Instalar as dependências
```bash
pip install -r server/knn-service/requirements.txt
```

### 3️⃣ Executar o microserviço
```bash
python server/knn-service/main.py
```

### 4️⃣ Rodar o servidor CoAP
O servidor CoAP também precisa ser iniciado. Para isso, siga os comandos abaixo:
```bash
cd server/coap-server
npm install
npm start
```

Agora, o servidor estará rodando e pronto para receber requisições!

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e enviar pull requests.

## 📜 Licença
Este projeto está licenciado sob a **Creative Commons BY-NC**. Isso significa que você pode usar, modificar e distribuir o código **desde que não o utilize para fins comerciais**. Para mais detalhes, consulte o arquivo `LICENSE`.

