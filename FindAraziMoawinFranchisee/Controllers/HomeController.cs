using System.Diagnostics;
using System.Net.Http;
using System.Text.Json;
using FindAraziMoawinFranchisee.Models;
using Microsoft.AspNetCore.Mvc;

namespace FindAraziMoawinFranchisee.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly HttpClient _httpClient;

        public HomeController(ILogger<HomeController> logger, IHttpClientFactory factory)
        {
            _logger = logger;
            _httpClient = _httpClient = factory.CreateClient("PLRA");
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> GetDistricts()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://fbe-prod.punjab-zameen.gov.pk:8080/api/public/franchisee/districts");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return BadRequest();

            var json = await response.Content.ReadAsStringAsync();
            var parsed = JsonDocument.Parse(json).RootElement.GetProperty("content");
            return Json(parsed);
        }

        [HttpGet]
        public async Task<IActionResult> GetTehsils(int districtId)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"https://fbe-prod.punjab-zameen.gov.pk:8080/api/public/franchisee/tehsils?districtId={districtId}");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return BadRequest();

            var json = await response.Content.ReadAsStringAsync();
            var parsed = JsonDocument.Parse(json).RootElement.GetProperty("content");
            return Json(parsed);
        }

        [HttpGet]
        public async Task<IActionResult> GetFranchiseeOffices(int districtId, int tehsilId)
        {
            var request = districtId == 0? new HttpRequestMessage(HttpMethod.Get, $"https://fbe-prod.punjab-zameen.gov.pk:8080/api/public/franchisee/offices") : 
                          tehsilId == 0?   new HttpRequestMessage(HttpMethod.Get, $"https://fbe-prod.punjab-zameen.gov.pk:8080/api/public/franchisee/offices?districtId={districtId}"):
                                           new HttpRequestMessage(HttpMethod.Get, $"https://fbe-prod.punjab-zameen.gov.pk:8080/api/public/franchisee/offices?districtId={districtId}&tehsilId={tehsilId}");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return BadRequest();

            var json = await response.Content.ReadAsStringAsync();
            var parsed = JsonDocument.Parse(json).RootElement.GetProperty("content");
            return Json(parsed);
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
