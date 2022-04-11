#!/usr/bin/env python3

"""check_empty_cell.py: Check if a cell in a CSV file is empty."""

__author__      = "Bjoern Schilberg"
__copyright__   = "Copyright 2016, Intevation GmbH"
__license__     = "GPL"
__version__     = "1.0.0"
__email__       = "bjoern@intevation.de"

import csv
import argparse

parser = argparse.ArgumentParser(description='Check script if a cell in a CSV file is empty.')
parser.add_argument('-i','--input', help='Input CSV file name',required=True)
parser.add_argument('-d','--delete', help='Delete rows with empty cells in it.',action="store_true",required=False)
parser.add_argument('-o','--output', help='Output CSV file name',required=False)
args = parser.parse_args()

if args.delete:

    with open(args.input, newline='', encoding='utf-8') as inputfile, open(args.output, 'w', newline='', encoding='utf8') as outputfile:
        csvreader = csv.reader(inputfile)
        csvwriter = csv.writer(outputfile)
        for row in csvreader:
            if row[0] in (None, ""):
                continue
            else:
                csvwriter.writerow(row)
else:

    with open(args.input, newline='', encoding='utf-8') as csvfile:
        csvreader = csv.reader(csvfile)
        for row in csvreader:
            #print(row)
            if row[0] in (None, ""):
                print("Zeile "+str(csvreader.line_num)+": "+str(row))


