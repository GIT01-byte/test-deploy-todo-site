FROM python:3.11.9-slim

COPY requierements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "main.py"]