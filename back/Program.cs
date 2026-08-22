var builder = WebApplication.CreateBuilder(args);

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

// Usar el middleware de CORS
app.UseCors("AllowAstro");

app.UseAuthorization();
app.MapControllers();

app.Run();