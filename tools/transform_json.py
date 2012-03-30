import json
import os
import sys
import glob

def main(vehicle_json_file_dir):
    data = load_data(vehicle_json_file_dir)
    generate_station_hours(data)
    generate_edge_hours(data)


def load_data(json_dir):
    data = []
    seen_ids = {}
    for f in glob.glob(json_dir + '/*'):
        print 'Loading file ', f
        new_data = json.load(open(f))
        for item in new_data:
            if not item['id'] in seen_ids:
                data.append(item)
                seen_ids[item['id']] = True
    return data


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
    stations_compressed = {}
    for station, hours in stations.iteritems():
        for hour, ids in hours.iteritems():
            stations_compressed.setdefault(station, {})[hour] = len(ids)
    out = open('station_hours_compressed.json','wb')
    json.dump(stations_compressed, out)



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
    edges_compressed = {}
    trains_hist = {}
    for edge, hours in edges_result.iteritems():
        for hour, ids in hours.iteritems():
            edges_compressed.setdefault(edge, {})[hour] = len(ids)
            trains_hist.setdefault(str(hour), 0)
            trains_hist[str(hour)] += len(ids)
    out = open('edge_hours_compressed.json','wb')
    json.dump(edges_compressed, out)
    for hour, num_stops in trains_hist.iteritems():
        print hour, num_stops


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print 'Usage: ' + __file__ + ' vehicle-json-file'
    else:
        main(sys.argv[1])
