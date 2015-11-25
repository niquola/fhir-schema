rm -rf tmp/*
wget http://hl7-fhir.github.io/examples-json.zip -O ./tmp/my.zip
cd tmp
unzip my.zip
cd ..

rm -rf fhir
mkdir fhir
cd fhir
rm *.json
rm *.xml
wget http://hl7-fhir.github.io/all-valuesets.zip
unzip all-valuesets.zip
rm all-valuesets.zip
rm *.xml
wget http://hl7-fhir.github.io/search-parameters.json
wget http://hl7-fhir.github.io/profiles-resources.json
wget http://hl7-fhir.github.io/profiles-types.json
