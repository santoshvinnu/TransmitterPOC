#!/bin/bash
# Script used to run the multiple instances of transmitter clients
# Command Line Arguments:
#  runclients [-s <Server IP>] [-p <Server Port>] [-n Clients] <cmd>
# To check the clients running status us the ps command
#  ps aux | grep nodejs

# Default Values for Parameters
SERVERADDR=192.168.1.10
SERVERPORT=8080
CLIENTS=10
INTERVAL=5

# Default command
CMD="start"

# Process command line arguments
while [[ $# > 0 ]]; do
  echo "[$1] [$2]"
  key=$1
  case $key in
    -s|--server)
      SERVERADDR="$2"
      shift
      ;;
    -p|--port)
      SERVERPORT="$2"
      shift
      ;;
    -n|--clients)
      CLIENTS="$2"
      shift
      ;;
    -i|--interval)
      INTERVAL="$1"
      shift
      ;;
    -h|--help)
      echo "USAGE:"
      echo "  $0 [-s <Server IP>] [-p <Server Port>] [-n Clients] <cmd>"
      echo "  Commands:"
      echo "    start : Start running the clients"
      echo "    stop  : Stop all running clients"
      exit 0
      ;;
    start|stop)
      CMD="$1"
      shift
      ;;
    *)
      echo "ERROR: Unknown parameter $1"
      exit 1
      ;;
esac
shift
done

if [ "x$CMD" == "xstart" -o "x$CMD" == "x" ]; then
  echo "Running $CLIENTS transmitters with $INTERVAL sec update interval"

  if [ $CLIENTS -gt 0 ]; then
    i=1
    while [ $i -le $CLIENTS ]; do
      nohup nodejs Client.js $((INTERVAL*1000)) $i &
      echo "instance $a of transmitter client started"
      i=$((i+1))
    done
  fi
fi

if [ "x$CMD" == "xstop" ]; then
  killall nodejs
fi

