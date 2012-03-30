import json
import os

trains = {}

def main():
    tf = open('../vehicle-simulator/api/vehicles/0900.json')
    data = json.load(tf)
    stations = {}
    for item in data:
        trains[item['id']] = item
        arrivals = item['arrs']
        departures = item['deps']
        arrivals = [departures[0]] + arrivals
        departures = departures + [arrivals[-1]]
        idx = 0
        for station in item['sts']:
            stations.setdefault(station, {})
            arrival_hour = str(arrivals[idx] / 3600)
            departure_hour = str(arrivals[idx] / 3600)
            stations[station].setdefault(arrival_hour, []).append(item['id'])
            if arrival_hour != departure_hour:
                stations[station].setdefault(departure_hour, []).append(item['id'])
            idx += 1
    out = open('station_hours.json','wb')
    json.dump(stations, out)

    edges_result = {}
    for item in data:
        arrivals = item['arrs']
        departures = item['deps']
        idx = 0
        for edges_str in item['edges']:
            if not edges_str:
                continue
            stations.setdefault(station, {})
            arrival_hour = arrivals[idx] / 3600
            departure_hour = arrivals[idx] / 3600
            edges = edges_str.split(",")
            travel_time = arrival_hour - departure_hour
            edge_idx = 0
            for edge in edges:
                edge_hour = travel_time/len(edges) * edge_idx + arrival_hour
                edges_result.setdefault(edge, {}).setdefault(edge_hour, []).append(item['id'])
                edge_idx += 1
            idx += 1
    out = open('edge_hours.json','wb')
    json.dump(edges_result, out)



if __name__ == '__main__':
    main()
