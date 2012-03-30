import json
import os
import sys


def main(vehicle_json_file):
    tf = open(vehicle_json_file)
    data = json.load(tf)
    generate_station_hours(data)
    generate_edge_hours(data)


def generate_station_hours(data):
    stations = {}
    for item in data:
        arrivals = item['arrs']
        departures = item['deps']
        arrivals = [departures[0]] + arrivals
        departures = departures + [arrivals[-1]]
        for idx, station in enumerate(item['sts']):
            stations.setdefault(station, {})
            arrival_hour = str(arrivals[idx] / 3600)
            departure_hour = str(arrivals[idx] / 3600)
            stations[station].setdefault(arrival_hour, []).append(item['id'])
            if arrival_hour != departure_hour:
                stations[station].setdefault(departure_hour, []).append(item['id'])
    out = open('station_hours.json','wb')
    json.dump(stations, out)


def generate_edge_hours(data):
    edges_result = {}
    for item in data:
        arrivals = item['arrs']
        departures = item['deps']
        for idx, edges_str in enumerate(item['edges']):
            if not edges_str:
                continue
            arrival_hour = arrivals[idx - 1] / 3600
            departure_hour = arrivals[idx - 1] / 3600
            edges = edges_str.split(",")
            travel_time = arrival_hour - departure_hour
            for edge_idx, edge in enumerate(edges):
                edge_hour = travel_time/len(edges) * edge_idx + arrival_hour
                edges_result.setdefault(edge, {}).setdefault(edge_hour, []).append(item['id'])
    out = open('edge_hours.json','wb')
    json.dump(edges_result, out)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print 'Usage: ' + __file__ + ' vehicle-json-file'
    else:
        main(sys.argv[1])
