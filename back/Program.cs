using Microsoft.EntityFrameworkCore;
using back.Data;

var builder = WebApplication.CreateBuilder(args);

// Configurar DbContext con SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar controladores
builder.Services.AddControllers();

// Configurar CORS para permitir la conexión desde Astro
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAstro", policy =>
    {
        policy.WithOrigins("http://localhost:4321") // Puerto por defecto de Astro
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Asegurar que la base de datos sea creada automáticamente al iniciar
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();
}

// Usar el middleware de CORS
app.UseCors("AllowAstro");

app.UseAuthorization();
app.MapControllers();

app.Run();