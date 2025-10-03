# APLICAÇÃO BACKEND:
Para rodar o projeto é necessário fazer uma série de passos que estão listados abaixo:
- Abra o projeto no Visual Studio Code
- Dê CTRL + J ou abra o terminal manualmente
- Crie a Env do Projeto: python -m venv env
- Ative a Env do Projeto: .\env\Scripts\activate
- Instale os requirements que estão no arquivo requirements.txt: pip install -r requirements.txt
- Dê makemigration no terminal do projeto (se necessário): python .\manage.py makemigrations
- Dê migrate para que tudo migre corretamente na máquina (se necessário): python .\manage.py migrate
- Crie o SuperUser (se necessário): python manage.py createsuperuser
- Por fim, rode o projeto: python manage.py runserver
