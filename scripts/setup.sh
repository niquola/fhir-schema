set +e
rm -rf examples/*
mkdir examples
wget http://build.fhir.org/examples-json.zip -O ./examples/my.zip
cd examples
unzip my.zip
cd ..

rm -rf fhir
mkdir fhir
cd fhir

rm *.json
rm *.xml

wget http://build.fhir.org/all-valuesets.zip
unzip all-valuesets.zip

rm all-valuesets.zip
rm *.xml
wget http://build.fhir.org/search-parameters.json
wget http://build.fhir.org/profiles-resources.json
wget http://build.fhir.org/profiles-types.json
