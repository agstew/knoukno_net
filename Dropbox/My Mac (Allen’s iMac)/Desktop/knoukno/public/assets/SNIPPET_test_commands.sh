# Health
curl -i http://127.0.0.1:5001/healthz

# Starter (one-time) 20% off
curl -sS -X POST http://127.0.0.1:5001/pay/checkout \
  -H 'Content-Type: application/json' \
  -d '{"plan":"starter","promo":{"percent":20}}' | jq .

# Member monthly 20% for 12 months
curl -sS -X POST http://127.0.0.1:5001/pay/checkout \
  -H 'Content-Type: application/json' \
  -d '{"plan":"member","billing":"monthly","promo":{"percent":20,"months":12}}' | jq .

# Member annual 20% off upfront
curl -sS -X POST http://127.0.0.1:5001/pay/checkout \
  -H 'Content-Type: application/json' \
  -d '{"plan":"member","billing":"annual","promo":{"percent":20,"annual":true}}' | jq .
