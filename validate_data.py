import json

with open('data/microgridData.json') as f:
    data = json.load(f)

for item in data:
    hour = int(item['timestamp'][11:13])
    if hour in [6, 10, 18, 21]:
        print(f'Hour {hour}:')
        print(f'  total_demand: {item["total_demand"]}')
        print(f'  solar_generation: {item["solar_generation"]}')
        print(f'  battery_level: {item["battery_level"]}')
        print(f'  temperature: {item["temperature"]}')
        print(f'  cloud_cover: {item["cloud_cover"]}')
        print()

demands = [i['total_demand'] for i in data]
solars = [i['solar_generation'] for i in data]
batteries = [i['battery_level'] for i in data]

print(f'Max demand: {max(demands)}')
print(f'Max solar: {max(solars)}')
print(f'Min battery: {min(batteries)}')
print(f'Max battery: {max(batteries)}')

negatives = [i for i in data if i['total_demand'] < 0 or i['solar_generation'] < 0 or i['battery_level'] < 0]
print(f'Negative values found: {len(negatives)}')

impossible_battery = [i for i in data if i['battery_level'] < 0 or i['battery_level'] > 100]
print(f'Impossible battery levels: {len(impossible_battery)}')

night_solar = [i for i in data if (int(i['timestamp'][11:13]) < 6 or int(i['timestamp'][11:13]) > 18) and i['solar_generation'] > 0]
print(f'Night solar generation found: {len(night_solar)}')
