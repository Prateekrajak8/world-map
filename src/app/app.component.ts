import { ChangeDetectorRef, Component , ElementRef} from '@angular/core';
import * as t from 'topojson';
import * as d3 from 'd3';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { saveAs } from 'file-saver';
import {saveAs} from 'file-saver';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  svg:any = d3.select('svg');
  pathData: any;
  countryDetails: any;
  tooltipContent: string = '';
  // europeanCountries = [
  //   "Albania",
  //   "Andorra",
  //   "Armenia",
  //   "Austria",
  //   "Azerbaijan",
  //   "Belarus",
  //   "Belgium",
  //   "Bosnia and Herzegovina",
  //   "Bulgaria",
  //   "Croatia",
  //   "Cyprus",
  //   "Czech Republic",
  //   "Denmark",
  //   "Estonia",
  //   "Finland",
  //   "France",
  //   "Georgia",
  //   "Germany",
  //   "Greece",
  //   "Hungary",
  //   "Iceland",
  //   "Ireland",
  //   "Italy",
  //   "Kazakhstan",
  //   "Kosovo",
  //   "Latvia",
  //   "Liechtenstein",
  //   "Lithuania",
  //   "Luxembourg",
  //   "Malta",
  //   "Moldova",
  //   "Monaco",
  //   "Montenegro",
  //   "Netherlands",
  //   "North Macedonia",
  //   "Norway",
  //   "Poland",
  //   "Portugal",
  //   "Romania",
  //   "Russia",
  //   "San Marino",
  //   "Serbia",
  //   "Slovakia",
  //   "Slovenia",
  //   "Spain",
  //   "Sweden",
  //   "Switzerland",
  //   "Turkey",
  //   "Ukraine",
  //   "United Kingdom",
  //   "Vatican City"
  // ];

  europeanCountryISO_N3Codes = [
    '008', '020', '051', '040', '112', '056', '070', '100', '191',
    '196', '203', '208', '233', '246', '268', '276', '300', '348',
    '352', '372', '380', '398', '999', '428', '438', '440', '442', '470',
    '498', '492', '499', '528', '807', '578', '616', '620', '642',
    '674', '688', '703', '705', '724', '752', '756', '792', '804', '826',
    '336',
  ];
  northAmericanCountryISO_N3Codes = [
     '028', '052', '084', '124', '192', '212', '214', '308',
    '320', '332', '340', '388', '474', '500', '531', '533', '534', '535',
    '600', '604', '660', '662', '670', '780', '831', '850', '862', '092',
    '840'
  ];

  selectedContinent: any = '';


  constructor(
    private http: HttpClient,
    private _cdr: ChangeDetectorRef,
    private elRef: ElementRef
  ) {

  }

  async ngOnInit() {

    await d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json')
      .then((data: any) => {

        d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/50m.tsv').then((countryDetails: any) => {
          this.countryDetails = countryDetails;
          // 
          let country: any = t.feature(data, data.objects.countries);
          country = country.features.filter((data: any) => data.id !== '010');
          country = { features: country, type: "FeatureCollection" }
          this.pathData = country;

          const result =this.generateGraph(country);
        })
      }

      )
      console.log('Gener', this.svg)
  }


  handleChange(data: any) {
    if (this.selectedContinent === 'Europe') {

      let filteredCountriesDetails = this.countryDetails.filter((data: any) => this.europeanCountryISO_N3Codes.includes(data.iso_n3))

      filteredCountriesDetails = filteredCountriesDetails.reduce((accumulator: any, d: any) => {
        accumulator[d.iso_n3] = d.name;
        return accumulator;
      }, {});

      const filteredCountry = this.pathData.features.filter((data: any) => this.europeanCountryISO_N3Codes.includes(data.id))
      
      this.generateGraph({ features: filteredCountry, type: "FeatureCollection" })

      this.bindLabel(filteredCountriesDetails)
    } else if (this.selectedContinent === 'North America') {
      let filteredCountriesDetails = this.countryDetails.filter((data: any) => this.northAmericanCountryISO_N3Codes.includes(data.iso_n3))

      filteredCountriesDetails = filteredCountriesDetails.reduce((accumulator: any, d: any) => {
        accumulator[d.iso_n3] = d.name;
        return accumulator;
      }, {});

      const filteredCountry = this.pathData.features.filter((data: any) => this.northAmericanCountryISO_N3Codes.includes(data.id))

      this.generateGraph({ features: filteredCountry, type: "FeatureCollection" })

      this.bindLabel(filteredCountriesDetails)
    } else if (this.selectedContinent === 'Reset') {
      this.generateGraph(this.pathData);
    }


  }





  // generateGraph(countries: any) {
  //   this.svg.selectAll('path').remove();
  //   this.svg = d3.select('svg');
  //   const projection = d3.geoEquirectangular();
  //   const pathGenerator: any = d3.geoPath().projection(projection);
  //   this.svg.append('path')
  //     .attr('class', 'sphere')
  //     .attr('d', pathGenerator({ type: 'Sphere' }));
  //   const paths = this.svg.selectAll('path').data(countries.features);
  //       paths.enter().append('path').attr('d', pathGenerator)
  //     .attr('class', 'country').attr('id', (d: any) => `path${d.id}`).attr('data_id', (d: any) => `${d.id}`);
    
  // }
  generateGraph(countries: any) {
    this.svg.selectAll('*').remove();
    this.svg = d3.select('svg');
  
    const width = +this.svg.attr('width');
    const height = +this.svg.attr('height');
  
    // Define the center coordinates
    const centerCoordinates:any = [0, 0]; // [longitude, latitude]
  
    // Adjust projection settings
    const projection = d3.geoEquirectangular().center(centerCoordinates);
    const pathGenerator: any = d3.geoPath().projection(projection);
  
    // Append the background sphere
    // this.svg.append('path')
    //   .attr('class', 'sphere')
    //   .attr('d', pathGenerator({ type: 'Sphere' }));
  
    // Append paths for countries and center them
    const g = this.svg.append('g');
  
    const bounds = pathGenerator.bounds(countries); // Get bounding box of paths
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const scale = 0.9 / Math.max(dx / width, dy / height); // Adjust scale
  
    const translateX = (width - scale * (bounds[1][0] + bounds[0][0])) / 2;
    const translateY = (height - scale * (bounds[1][1] + bounds[0][1])) / 2;
  
    g.attr('transform', `translate(${translateX},${translateY}) scale(${scale})`);
  
    g.selectAll('path.country')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator)
      .attr('class', 'country')
      .attr('id', (d: any) => `path${d.id}`)
      .attr('data_id', (d: any) => `${d.id}`)
      .on('click', () => this.saveSvg());
  }
  saveSvg() {
    // Get the SVG content
    const svgContent = this.svg.node().outerHTML;

    // Create a Blob from the SVG content
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });

    // Save the Blob as a file using FileSaver
    saveAs(blob, 'world-map.svg');
  }

 async bindLabel(details: any) {

    const keys = Object.keys(details)
    keys.forEach(async(data: string) => {

      // Example structure of details object
      // const tooltipDetails = {
      //   name: details[data],
      //   additionalInfo: ['This is test fact 1.', 'This is test fact 2.', 'This is test fact 3.']
      // };

      // const response = await fetch('tooltip.html');
      const tooltipHTML = `<div style="display: grid; grid-gap: 0.5rem; background-color: white; padding: 5px;">
      <div style="font-size: large; font-weight: 900;">
          North America
      </div> <div style="display: grid; grid-gap: 0.3rem; padding:0.5rem">
      <div style="display: flex; gap: 0.5rem;">
          <div style="font-size: medium; font-weight: 700;">
              Russia:
          </div>
          <div>
              Russia boosts nuclear forces amid<br> ‘hybrid war’ with the West
          </div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
          <div style="font-size: medium; font-weight: 700;">
              Russia:
          </div>
          <div>
              Russia boosts nuclear forces amid<br> ‘hybrid war’ with the West
          </div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
          <div style="font-size: medium; font-weight: 700;">
              Russia:
          </div>
          <div>
              Russia boosts nuclear forces amid<br> ‘hybrid war’ with the West
          </div>
      </div>
  </div>
  </div>`;
      // let tooltipContent = `<strong>${tooltipDetails.name} + "\n"</strong>`;

      // tooltipDetails.additionalInfo.forEach((element: any, index) => {
      //   tooltipContent += `   . Fact ${index + 1}: ${element}\n`;
      // });
      const projection = d3.geoEquirectangular();
      const pathGenerator = d3.geoPath().projection(projection);
      const pathById:any = this.svg.select(`#path${data}`);

      const tooltip = d3.select('body') // Selecting the body to append the tooltip
    .append('div')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden') // Background color for the tooltip box
    .style('border', '1px solid black')
    .style('border-radius', '5px')  // Border for the tooltip box // Padding for the tooltip box
    .html(tooltipHTML);
      // Assuming `pathById` is your SVG element selected using D3.js
pathById.on('mouseover', (event: MouseEvent) => {
  const tooltipWidth = tooltip.node()?.getBoundingClientRect().width;
  const tooltipHeight = tooltip.node()?.getBoundingClientRect().height;
  tooltip.style('top', `${event.pageY - (tooltipHeight || 0)}px`)
            .style('left', `${event.pageX - (tooltipWidth || 0)}px`)
            .style('visibility', 'visible');
});
pathById.on('mouseout', () => {
  // Code to hide the tooltip
  tooltip.style('visibility', 'hidden');
});
  //  pathById.append('title')
  //     .html(tooltipHTML)
      // tooltipDiv.attr('class', 'tooltip'); // Apply a class for styling if needed

    })
  }
  // downloadPPT() {

  //   this.http.get('http://localhost:6054/DownloadPPT', { responseType: 'blob' }).subscribe((data: Blob) => {
  //     const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  //     // Create a link element
  //     const link = document.createElement('a');

  //     // Set the href attribute to a Blob URL
  //     link.href = window.URL.createObjectURL(blob);

  //     // Set the download attribute to specify the file name
  //     link.download = 'your-file-name.pptx';

  //     // Append the link to the body
  //     document.body.appendChild(link);

  //     // Programmatically trigger the click event on the link
  //     link.click();

  //     // Remove the link from the body
  //     document.body.removeChild(link);
  //   });
  //   ;
  // }
  downloadPPT() {
    const payload = {
      "customer_segments": [
        "aaaaaaaaaaaaaaaaaaaa1",
        "bbbbbbbbbbbbbbbbbbbb1"
      ],
      "adoption_ladder_focus": [
        "aaaaaaa2|aaaaaaaa2",
        "bbbbbbb2|bbbbbbbb2"
      ],
      "hcps_central_need": [
        "aaaaaaaaaaaa3",
        "bbbbbbbbbbbb3"
      ],
      "desired_thinking": [
        "aaaaaaaaaaa4",
        "bbbbbbbbbbb4"
      ],
      "desired_action": [
        "aaaaaaaaaaa5",
        "bbbbbbbbbbb5"
      ],
      "barriers_towards": [
        "aaaaaaaaaaaa6|aaaaaaaaaaaaa6|aaaaaaaaaaaa6|aaaaaaaaaaaaa6|aaaaaaaaaaaaa6",
        "bbbbbbbbbbbb6|bbbbbbbbbbbbb6|bbbbbbbbbbbb6|bbbbbbbbbbbbb6|bbbbbbbbbbbbb6"
      ],
      "drivers_to_achieving_bo's": [
        "aaaaaaaaaaaaaaaaaa7",
        "bbbbbbbbbbbbbbbbbb7"
      ],
      "engagement_objective": [
        "aaaaaaaaaaaaaaaaaa8",
        "bbbbbbbbbbbbbbbbbb8"
      ]
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // Add any other headers if needed
    });

    this.http.post('http://localhost:6054/api/pptx/thirteenthTemplate', payload, {
      responseType: 'blob',
      observe: 'response',
      headers: headers
    })
      .subscribe((response: any) => {
        console.log(response);
        saveAs(response.body, 'test.pptx');
      });
  }
  showTooltip() {
    // Show the tooltip - You can adjust this logic based on your tooltip's behavior
    const tooltip = this.elRef.nativeElement.querySelector('app-tooltip');
    tooltip.style.display = 'block';
  }

  hideTooltip() {
    // Hide the tooltip - You can adjust this logic based on your tooltip's behavior
    const tooltip = this.elRef.nativeElement.querySelector('app-tooltip');
    tooltip.style.display = 'none';
  }
}



