import json
import os
import sys
import glob
import csv

def main(vehicle_json_file_dir):
    distances = load_distances()
    data = load_data(vehicle_json_file_dir)
    generate_station_hours(data)
    generate_edge_hours(data)
    generate_station_arrivals(data)
    generate_train_speeds(data, distances)
    generate_station_freq_csv(data)


def load_distances():
    data = json.load(open('../data/spherical-geometry.json'))
    return data


def calculate_distance(edges, distances):
    retval = 0
    for edge in edges:
        if edge.startswith("-"):
            retval += distances.get(edge[1:], 0)
        else:
            retval += distances.get(edge, 0)
    return retval


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
            arrival_hour = arrivals[idx] / 3600
            departure_hour = departures[idx] / 3600
            if arrival_hour <= 23:
                stations[station].setdefault(arrival_hour, []).append(item['id'])
            if arrival_hour != departure_hour:
                if departure_hour <= 23:
                    stations[station].setdefault(departure_hour, []).append(item['id'])
    out = open('station_hours.json','wb')
    json.dump(stations, out)
    stations_compressed = {}
    for station, hours in stations.iteritems():
        for hour, ids in hours.iteritems():
            stations_compressed.setdefault(station, {})[hour] = len(ids)
    out = open('station_hours_compressed.json','wb')
    json.dump(stations_compressed, out)


def generate_station_arrivals(data):
    arrivals = {}
    for item in data:
        arrival_times = [item['deps'][0]] + item['arrs']
        for idx, arrival in enumerate(arrival_times):
            arrival = arrival - (arrival % 60)
            station = item['sts'][idx]
            arrivals.setdefault(arrival, {}).setdefault(station, 0)
            arrivals[arrival][station] += 1
    out = open('station_arrivals.json', 'wb')
    json.dump(arrivals, out)


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


def generate_train_speeds(data, distances):
    speed_per_edge = {}
    for item in data:
        arrivals = item['arrs']
        departures = item['deps']
        for idx, edges_str in enumerate(item['edges']):
            if not edges_str:
                continue
            arrival = arrivals[idx - 1]
            departure = departures[idx - 1]
            edges = edges_str.split(",")
            distance = calculate_distance(edges, distances)
            travel_time = arrival - departure
            if travel_time == 0:
                print 'travel_time is zero, bailing out'
                continue
            travel_speed = float(distance)/travel_time * 3.6
            for edge in edges:
                e = edge
                if edge.startswith("-"):
                    e = edge[1:]
                speed_per_edge.setdefault(e, [])
                speed_per_edge[e].append(travel_speed)
    avg_speeds_per_segment = {}
    for edge, speeds in speed_per_edge.iteritems():
        avg_speeds_per_segment[edge] = int(round(sum(speeds)/len(speeds)))
    out = open('avg_speeds_per_edge.json', 'wb')
    json.dump(avg_speeds_per_segment, out)

# station-nr, 0, 1, 2, 3, 4
def generate_station_freq_csv(data):
    writer = csv.writer(open('station_freq.csv', 'wb'))
    stations = {}
    for item in data:
        arrivals = item['arrs']
        departures = item['deps']
        arrivals = [departures[0]] + arrivals
        departures = departures + [arrivals[-1]]
        for idx, station in enumerate(item['sts']):
            stations.setdefault(station, {})
            arrival_hour = arrivals[idx] / 3600
            departure_hour = departures[idx] / 3600
            if arrival_hour <= 23:
                stations[station].setdefault('arr', {}).setdefault(arrival_hour, []).append(item['id'])
            if departure_hour <= 23:
                stations[station].setdefault('dep', {}).setdefault(departure_hour, []).append(item['id'])
    stations_compressed = {}
    for station, arr_dep in stations.iteritems():
        for hour, ids in arr_dep.get('arr', {}).iteritems():
            stations_compressed.setdefault(station, {}).setdefault('arr', {})[hour] = len(ids)
        for hour, ids in arr_dep.get('arr', {}).iteritems():
            stations_compressed.setdefault(station, {}).setdefault('arr', {})[hour] = len(ids)
    for station, arr_dep in stations_compressed.iteritems():
        record = [station]
        for h in range(24):
            record.append(arr_dep.get('arr', {}).get(h, 0))
            record.append(arr_dep.get('dep', {}).get(h, 0))
        writer.writerow(record)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print 'Usage: ' + __file__ + ' vehicle-json-file'
    else:
        main(sys.argv[1])
