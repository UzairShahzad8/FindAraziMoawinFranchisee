var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient("PLRA", client =>
{
    client.DefaultRequestHeaders.Add("x-api-key", "a3f7c1e9b2d40568c7fa12bd89e0f34c5a6d7e8f90b1c2d3e4f5061728394abc");
    client.DefaultRequestHeaders.Add("x-api-secret", "9de0c1b2a3f40596e7d8c9ba0f1e2d3c4b5a69788776655443322110ffeeddcc");
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
