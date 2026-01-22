/**
 * Shared Services Data
 * This file contains all services data that is shared between index.html and services.html
 * When admin updates this file, both pages will automatically reflect the changes.
 */

const servicesData = [
  {
    id: 1,
    icon: "fa-solid fa-building",
    title: "Construction",
    description: "Residential and commercial construction projects, road and infrastructure development, renovation and remodeling services.",
    link: "service-details.html"
  },
  {
    id: 2,
    icon: "fa-solid fa-gears",
    title: "Engineering & Supplies",
    description: "Complete supply of construction materials, heavy machinery, electrical & mechanical equipment. We provide end-to-end engineering solutions and quality supplies for projects across Gilgit-Baltistan.",
    link: "service-engineering-supplies.html"
  },
  {
    id: 3,
    icon: "fa-solid fa-solar-panel",
    title: "Solar Energy Solutions",
    description: "Supply and installation of solar panels, solar energy system design and engineering, maintenance and performance optimization.",
    link: "service-solar-energy.html"
  },
  {
    id: 4,
    icon: "fa-solid fa-lightbulb",
    title: "Consultancy Services",
    description: "Research and analysis for strategic decision-making, business development training programs, feasibility studies for project planning.",
    link: "service-consultancy.html"
  },
  {
    id: 5,
    icon: "fa-solid fa-laptop",
    title: "IT Solutions",
    description: "IT hardware and software supplies, networking and system integration, technical support and maintenance services.",
    link: "service-it-solutions.html"
  },
  {
    id: 6,
    icon: "fa-solid fa-gear",
    title: "General Services",
    description: "Road safety and traffic engineering, road network systems, proven standing in planning, execution, control and inspection of civil engineering works.",
    link: "service-general-solutions.html"
  }
];

// Section header data
const servicesHeader = {
  title: "Our Services",
  description: "We provide comprehensive solutions across construction, engineering, solar energy, consultancy, and IT sectors to meet all your project requirements."
};

/**
 * Renders the services section
 * @param {string} containerId - The ID of the container element to render services into
 */
function renderServices(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = '';

  servicesData.forEach((service, index) => {
    const delay = (index + 1) * 100;
    html += `
          <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${delay}">
            <div class="service-item position-relative">
              <div class="icon">
                <i class="${service.icon}"></i>
              </div>
              <h3>${service.title}</h3>
              <p>${service.description}</p>
              <a href="${service.link}" class="readmore stretched-link">Learn more <i class="bi bi-arrow-right"></i></a>
            </div>
          </div><!-- End Service Item -->
`;
  });

  container.innerHTML = html;
}

/**
 * Renders the services section header
 * @param {string} headerId - The ID of the header element
 */
function renderServicesHeader(headerId) {
  const header = document.getElementById(headerId);
  if (!header) return;

  header.innerHTML = `
          <h2>${servicesHeader.title}</h2>
          <p>${servicesHeader.description}</p>
  `;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Render services section header if element exists
  renderServicesHeader('services-header');

  // Render services items if container exists
  renderServices('services-container');

  // Re-initialize AOS for dynamically added elements
  if (typeof AOS !== 'undefined') {
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }
});
