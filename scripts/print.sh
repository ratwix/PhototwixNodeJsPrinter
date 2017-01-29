#!/bin/bash

# Don't forget to install selphy_print
# Pour avoir la liste des options : lpoptions -l
# Imprime sur l'imprimante par défaut

echo "Usage print.sh duplicate:[true|false] portrait:[true|false] cutter:[true|false] source.png"

duplicate=$1
portrait=$2
cutter=$3
source=$4

echo $duplicate
echo $portrait
echo $cutter
echo $source

dest=/tmp/phototwix_$RANDOM.jpg
media_cut=w288h432-div2
media_nocut=w288h432
media=$media_nocut
orientation=landscape

cp $source $dest

#Supprimer tout les fichiers qui ont plus de 5 minutes
find /tmp -maxdepth 1 -mmin +5 -type f -name "phototwix_*.jpg" -exec rm -f {} \;

#Manage duplication

if [ "$duplicate" == "duplicate:true" ]; then
	if [ "$portrait" == "portrait:true" ]; then
                convert  -density 300 "$dest" "$dest" -append "$dest"
	else
                convert  -density 300 "$dest" "$dest" +append "$dest"
	fi
fi

#Rotate if paysage

if [ "$portrait" == "portrait:false" ]; then
	orientation=portrait
fi

#Set cutter

if [ "$cutter" == "cutter:true" ]; then
	media=$media_cut
else
	media=$media_nocut
fi

#Print

lpr -o $orientation -o fit-to-page -o media=$media $dest
